package internal

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
)

type ExecuteRequest struct {
	Version  string   `json:"version"`
	File     string   `json:"file"`
	FileType string   `json:"fileType"`
	Args     []string `json:"args"`
}

type ExecuteResponse struct {
	Data string `json:"data"`
}

func executeHTTPHandler(executor *Executor) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
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

		out, err := executor.Execute(ExecuteArgs{
			Version:  req.Version,
			FileType: req.FileType,
			File:     req.File,
			Args:     req.Args,
		})
		if err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		writeJSON(rw, ExecuteResponse{Data: out}, http.StatusOK)
	}
}
