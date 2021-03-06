package storage

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/tomwright/daselplayground/internal/domain"
	"log"
)

func NewMySQLSnippetStore(db *sql.DB) SnippetStore {
	return &mysqlSnippetStore{
		db: db,
	}
}

type mysqlSnippetStore struct {
	db *sql.DB
}

var (
	ErrInsertFailed = errors.New("could not create snippet")
	ErrSelectFailed = errors.New("could not get snippet")
)

func (s *mysqlSnippetStore) Create(snippet *domain.Snippet) error {
	query := `INSERT INTO snippets (id, input, args, version) VALUES (?, ?, ?, ?);`
	binds := []interface{}{
		snippet.ID,
		snippet.Input,
		snippet.Args,
		snippet.Version,
	}

	_, err := s.db.Exec(query, binds...)
	if err != nil {
		log.Printf("could not create snippet: %s\n", err)
		return ErrInsertFailed
	}
	return nil
}

func (s *mysqlSnippetStore) Get(id string) (*domain.Snippet, error) {
	query := `SELECT id, input, args, version FROM snippets WHERE id = ? LIMIT 1;`
	binds := []interface{}{
		id,
	}

	snippet := &domain.Snippet{}

	err := s.db.QueryRow(query, binds...).Scan(&snippet.ID, &snippet.Input, &snippet.Args, &snippet.Version)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrSnippetNotFound
		}
		log.Printf("could not select snippet: %s\n", err)
		return nil, ErrSelectFailed
	}
	return snippet, nil
}

func (s *mysqlSnippetStore) StoreExecution(snippet *domain.Snippet, args []string, output string, successful bool) error {
	parsedArgs, err := json.Marshal(args)
	if err != nil {
		return fmt.Errorf("could not marshal args: %w", err)
	}
	query := `INSERT INTO snippet_executions (id, snippet_id, input, args, version, created_at, parsed_args, output, successful) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?);`
	binds := []interface{}{
		uuid.New().String(),
		snippet.ID,
		snippet.Input,
		snippet.Args,
		snippet.Version,
		parsedArgs,
		output,
		successful,
	}

	_, err = s.db.Exec(query, binds...)
	if err != nil {
		log.Printf("could not store snippet execution: %s\n", err)
		return ErrInsertFailed
	}
	return nil
}
