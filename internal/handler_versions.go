package internal

import (
	"net/http"
)

type VersionsResponse struct {
	Versions []string `json:"versions"`
}

func versionsHTTPHandler(executor *Executor) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		writeJSON(rw, VersionsResponse{Versions: executor.Versions()}, http.StatusOK)
	}
}
