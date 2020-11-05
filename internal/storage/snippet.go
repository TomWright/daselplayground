package storage

import (
	"fmt"
	"github.com/tomwright/daselplayground/internal/domain"
)

var (
	ErrSnippetNotFound = fmt.Errorf("snippet not found")
)

type SnippetStore interface {
	Create(snippet *domain.Snippet) error
	Get(id string) (*domain.Snippet, error)
}
