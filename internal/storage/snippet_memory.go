package storage

import "github.com/tomwright/daselplayground/internal/domain"

func NewInMemorySnippetStore() SnippetStore {
	return &inMemorySnippetStore{
		data: map[string]*domain.Snippet{},
	}
}

type inMemorySnippetStore struct {
	data map[string]*domain.Snippet
}

func (s *inMemorySnippetStore) Create(snippet *domain.Snippet) error {
	s.data[snippet.ID] = snippet
	return nil
}

func (s *inMemorySnippetStore) Get(id string) (*domain.Snippet, error) {
	snippet, ok := s.data[id]
	if !ok {
		return nil, ErrSnippetNotFound
	}
	return snippet, nil
}
