package storage

import (
	"database/sql"
	"fmt"
	"github.com/tomwright/daselplayground/internal/domain"
)

func NewMySQLSnippetStore(db *sql.DB) SnippetStore {
	return &mysqlSnippetStore{
		db: db,
	}
}

type mysqlSnippetStore struct {
	db *sql.DB
}

func (s *mysqlSnippetStore) Create(snippet *domain.Snippet) error {
	query := `INSERT INTO snippets (id, input, args, version) (?, ?, ?, ?);`
	binds := []interface{}{
		snippet.ID,
		snippet.Input,
		snippet.Args,
		snippet.Version,
	}

	_, err := s.db.Exec(query, binds...)
	if err != nil {
		return fmt.Errorf("could not create snippet: %w", err)
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
		return nil, fmt.Errorf("could not query snippet: %w", err)
	}
	return snippet, nil
}
