package storage

import (
	"errors"
	"github.com/tomwright/daselplayground/internal/domain"
)

var (
	ErrSnippetNotFound = errors.New("snippet not found")
)

type SnippetStore interface {
	Create(snippet *domain.Snippet) error
	Get(id string) (*domain.Snippet, error)
}
