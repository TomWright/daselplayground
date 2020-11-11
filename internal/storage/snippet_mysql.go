package storage

import (
	"database/sql"
	"errors"
	"fmt"
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
	query := `INSERT INTO snippets (id, input, args, version) ($1, $2, $3, $4);`
	binds := []interface{}{
		snippet.ID,
		snippet.Input,
		snippet.Args,
		snippet.Version,
	}

	_, err := s.db.Exec(query, binds...)
	if err != nil {
		log.Printf("could not create snippet: %s\n", err)
		return ErrSelectFailed
	}
	return nil
}

func (s *mysqlSnippetStore) Get(id string) (*domain.Snippet, error) {
	query := `SELECT id, input, args, version FROM snippets WHERE id = $1 LIMIT 1;`
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
		return nil, ErrInsertFailed
	}
	return snippet, nil
}
