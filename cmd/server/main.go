package main

import (
	"context"
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/tomwright/daselplayground/internal"
	"github.com/tomwright/daselplayground/internal/storage"
	"github.com/tomwright/lifetime"
	"log"
	"os"
	"strings"
)

func main() {
	db, err := mysqlConnect()
	if err != nil {
		log.Printf("could not connect to mysql: %s", err)
		os.Exit(1)
	}

	if err := migrateUp(db); err != nil {
		log.Printf("could not migrate up: %s", err)
		os.Exit(1)
	}

	executor := internal.NewExecutor()
	snippetStore := storage.NewMySQLSnippetStore(db)

	for _, build := range strings.Split(os.Getenv("DASEL_BUILDS"), ",") {
		split := strings.Split(build, ":")
		executor.RegisterVersion(&internal.VersionOpts{
			Version: split[0],
			Path:    split[1],
		})
	}

	httpService := internal.NewHTTPService(os.Getenv("HTTP_LISTEN_ADDRESS"), executor, snippetStore)

	lt := lifetime.New(context.Background()).Init()

	// Start the http service.
	lt.Start(httpService)

	// Wait for all routines to stop running.
	lt.Wait()
}

func mysqlConnect() (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true&multiStatements=true",
		os.Getenv("MYSQL_USERNAME"),
		os.Getenv("MYSQL_PASSWORD"),
		os.Getenv("MYSQL_HOST"),
		os.Getenv("MYSQL_PORT"),
		os.Getenv("MYSQL_DATABASE"),
	)
	db, err := sql.Open("mysql", dsn)
	log.Printf("dsn: %s\n", dsn)
	if err != nil {
		return nil, fmt.Errorf("mysql open failed: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("mysql ping failed: %w", err)
	}
	return db, nil
}

func migrateUp(db *sql.DB) error {
	migrationsPath := os.Getenv("MIGRATIONS_PATH")
	if migrationsPath == "" {
		migrationsPath = "migrations"
	}
	driver, err := mysql.WithInstance(db, &mysql.Config{})
	if err != nil {
		return fmt.Errorf("could not get driver instance: %w", err)
	}
	m, err := migrate.NewWithDatabaseInstance("file://"+migrationsPath, "mysql", driver)
	if err != nil {
		return fmt.Errorf("could not get migrate instance: %w", err)
	}
	if err := m.Up(); err != nil {
		return fmt.Errorf("migrate up failed: %w", err)
	}
	return nil
}
