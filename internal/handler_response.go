package internal

import (
	"encoding/json"
	"net/http"
)

func writeResponse(rw http.ResponseWriter, data []byte, status int) {
	rw.WriteHeader(status)
	if _, err := rw.Write(data); err != nil {
		panic(err)
	}
}

func writeJSON(rw http.ResponseWriter, data interface{}, status int) {
	bytes, err := json.Marshal(data)
	if err != nil {
		writeErr(rw, err, http.StatusInternalServerError)
		return
	}
	rw.Header().Set("Content-Type", "application/json")
	writeResponse(rw, bytes, status)
}

func writeErr(rw http.ResponseWriter, err error, status int) {
	writeJSON(rw, ErrorResponse{Error: err}, status)
}

type ErrorResponse struct {
	Error error `json:"error"`
}
