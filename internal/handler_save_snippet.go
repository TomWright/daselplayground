package internal

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/tomwright/daselplayground/internal/domain"
	"github.com/tomwright/daselplayground/internal/storage"
	"io/ioutil"
	"net/http"
)

type SaveSnippetRequest struct {
	Snippet *domain.Snippet `json:"snippet"`
}

type SaveSnippetResponse struct {
	Snippet *domain.Snippet `json:"snippet"`
}

var (
	ErrMissingSnippet = errors.New("missing snippet")
)

func saveSnippetHTTPHandler(executor *Executor, snippetStore storage.SnippetStore) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == "OPTIONS" {
			// This is likely a pre-flight CORS request.
			return
		}

		if r.Method != http.MethodPost {
			rw.WriteHeader(http.StatusNotFound)
			return
		}

		bytes, err := ioutil.ReadAll(r.Body)
		if err != nil {
			writeErr(rw, err, http.StatusBadRequest)
			return
		}
		var req SaveSnippetRequest
		if err := json.Unmarshal(bytes, &req); err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		if err := validateSaveSnippet(req.Snippet); err != nil {
			writeErr(rw, err, http.StatusBadRequest)
			return
		}

		req.Snippet.ID = uuid.New().String()

		if err := snippetStore.Create(req.Snippet); err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		writeJSON(rw, SaveSnippetResponse{
			Snippet: req.Snippet,
		}, http.StatusCreated)
	}
}

func validateSaveSnippet(snippet *domain.Snippet) error {
	if snippet == nil {
		return ErrMissingSnippet
	}

	if snippet.Args == nil {
		snippet.Args = []*domain.Arg{}
	}

	newArgs := make([]*domain.Arg, 0)
	for _, a := range snippet.Args {
		if a.Name == "" {
			continue
		}
		newArgs = append(newArgs, a)
	}
	snippet.Args = newArgs

	return nil
}
