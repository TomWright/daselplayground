package internal

import (
	"errors"
	"github.com/tomwright/daselplayground/internal/domain"
	"github.com/tomwright/daselplayground/internal/storage"
	"net/http"
)

type GetSnippetResponse struct {
	Snippet *domain.Snippet `json:"snippet"`
}

var (
	ErrMissingSnippetID = errors.New("missing snippet id")
)

func getSnippetHTTPHandler(executor *Executor, snippetStore storage.SnippetStore) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == "OPTIONS" {
			// This is likely a pre-flight CORS request.
			return
		}

		if r.Method != http.MethodGet {
			rw.WriteHeader(http.StatusNotFound)
			return
		}

		id := r.URL.Query().Get("id")
		if id == "" {
			writeErr(rw, ErrMissingSnippetID, http.StatusBadRequest)
		}

		snippet, err := snippetStore.Get(id)
		if err != nil {
			if errors.Is(err, storage.ErrSnippetNotFound) {
				writeErr(rw, err, http.StatusNotFound)
				return
			}
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		writeJSON(rw, GetSnippetResponse{
			Snippet: snippet,
		}, http.StatusCreated)
	}
}

func validateGetSnippet(snippet *domain.Snippet) error {
	if snippet == nil {
		return ErrMissingSnippet
	}
	return nil
}
