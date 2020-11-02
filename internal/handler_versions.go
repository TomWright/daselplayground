package internal

import (
	"net/http"
)

type VersionsResponse struct {
	Versions []string `json:"versions"`
}

func versionsHTTPHandler(executor *Executor) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			rw.WriteHeader(http.StatusNotFound)
			return
		}
		writeJSON(rw, VersionsResponse{Versions: executor.Versions()}, http.StatusOK)
	}
}
