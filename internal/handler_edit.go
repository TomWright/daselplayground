package internal

import (
	"html/template"
	"log"
	"net/http"
	"strings"
)

type pageData struct {
	Title string `json:"title"`
}

type editData struct {
	pageData

	Snippet   *snippet     `json:"snippet"`
	Versions  []*version   `json:"versions"`
	FileTypes []*fileTypes `json:"fileTypes"`
}

type snippet struct {
	ID       string   `json:"id"`
	File     string   `json:"file"`
	FileType string   `json:"fileType"`
	Args     []string `json:"args"`
	Version  string   `json:"version"`
}

type version struct {
	Label    string `json:"label"`
	Value    string `json:"value"`
	Selected bool   `json:"selected"`
}

type fileTypes struct {
	Label    string `json:"label"`
	Value    string `json:"value"`
	Selected bool   `json:"selected"`
}

const editPrefix = "/p/"

var editTemplate = template.Must(template.ParseFiles("./internal/frontend/edit.html"))
var genericPageData = pageData{
	Title: "Dasel Playground",
}

func getFileTypes() []*fileTypes {
	return []*fileTypes{
		{
			Label: "JSON",
			Value: "json",
		},
		{
			Label: "YAML",
			Value: "yaml",
		},
		{
			Label: "TOML",
			Value: "toml",
		},
		{
			Label: "XML",
			Value: "xml",
		},
	}
}

// editHTTPHandler renders the frontend page
func editHTTPHandler(executor *Executor) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && !strings.HasPrefix(r.URL.Path, editPrefix) {
			http.NotFound(rw, r)
			return
		}

		var snip *snippet

		if strings.HasPrefix(r.URL.Path, editPrefix) {
			id := r.URL.Path[3:]
			log.Printf("load id: %s\n", id)
			snip = &snippet{
				ID: id,
			}
		}

		versions := make([]*version, 0)
		for _, v := range executor.Versions() {
			versions = append(versions, &version{
				Value:    v,
				Label:    v,
				Selected: false,
			})
		}

		fileTypes := getFileTypes()

		if snip == nil {
			snip = &snippet{
				ID:       "",
				File:     `{"greeting": "Hello world!"}`,
				FileType: "json",
				Args:     []string{".greeting"},
				Version:  versions[0].Value,
			}
		}

		for _, v := range versions {
			if v.Value == snip.Version {
				v.Selected = true
			}
		}
		for _, v := range fileTypes {
			if v.Value == snip.FileType {
				v.Selected = true
			}
		}

		rw.Header().Set("Content-Type", "text/html; charset=utf-8")
		data := &editData{
			pageData:  genericPageData,
			Snippet:   snip,
			Versions:  versions,
			FileTypes: fileTypes,
			// Share:     allowShare(r),
			// Analytics: r.Host == hostname,
			// GoVersion: runtime.Version(),
		}
		if err := editTemplate.Execute(rw, data); err != nil {
			log.Printf("editTemplate.Execute(w, %+v): %v", data, err)
			return
		}
	}
}
