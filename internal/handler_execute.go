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
	Args []string `json:"args"`
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

		out, daselArgs, daselErr, err := executor.Execute(ExecuteArgs{
			Version:  req.Version,
			FileType: req.FileType,
			File:     req.File,
			Args:     req.Args,
		})
		if err != nil {
			writeErr(rw, err, http.StatusInternalServerError)
			return
		}

		if daselErr != nil {
			writeJSON(rw, ExecuteResponse{
				Data: daselErr.Error(),
				Args: daselArgs,
			}, http.StatusBadRequest)
			return
		}

		writeJSON(rw, ExecuteResponse{
			Data: out,
			Args: daselArgs,
		}, http.StatusOK)
	}
}
