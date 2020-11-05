package internal

import (
	"encoding/json"
	"github.com/tomwright/daselplayground/internal/domain"
	"io/ioutil"
	"net/http"
)

type ExecuteRequest struct {
	Snippet *domain.Snippet `json:"snippet"`
}

type ExecuteResponse struct {
	Data string `json:"data"`
}

func executeHTTPHandler(executor *Executor) func(rw http.ResponseWriter, r *http.Request) {
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
		var req ExecuteRequest
		if err := json.Unmarshal(bytes, &req); err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		if req.Snippet == nil {
			writeErr(rw, ErrMissingSnippet, http.StatusBadRequest)
			return
		}

		out, daselErr, err := executor.Execute(ExecuteArgs{
			Snippet: req.Snippet,
		})
		if err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		if daselErr != nil {
			writeJSON(rw, ExecuteResponse{
				Data: daselErr.Error(),
			}, http.StatusBadRequest)
			return
		}

		writeJSON(rw, ExecuteResponse{
			Data: out,
		}, http.StatusOK)
	}
}
