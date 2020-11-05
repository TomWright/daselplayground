package internal

import (
	"github.com/tomwright/daselplayground/internal/storage"
	"log"
	"net/http"
	"strings"
)

// NewHTTPService returns a service that can be used to start a http server
// that will generate diagrams.
func NewHTTPService(listenAddress string, executor *Executor, snippetStore storage.SnippetStore) *httpService {
	return &httpService{
		listenAddress: listenAddress,
		executor:      executor,
		snippetStore:  snippetStore,
	}
}

// httpService is a service that can be used to start a http server
// that will generate diagrams.
type httpService struct {
	listenAddress string
	httpServer    *http.Server
	executor      *Executor
	snippetStore  storage.SnippetStore
}

const editPrefix = "/s/"

// Start starts the HTTP server.
func (s *httpService) Start() error {
	r := http.NewServeMux()
	// r.HandleFunc("/", editHTTPHandler(s.executor))
	// r.HandleFunc(editPrefix, editHTTPHandler(s.executor))
	r.HandleFunc("/versions", versionsHTTPHandler(s.executor))
	r.HandleFunc("/execute", executeHTTPHandler(s.executor))

	getSnippetHandler := getSnippetHTTPHandler(s.executor, s.snippetStore)
	createSnippetHandler := saveSnippetHTTPHandler(s.executor, s.snippetStore)

	r.HandleFunc("/snippet", func(rw http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodOptions:
			rw.Header().Set("Access-Control-Allow-Origin", "*")
			return
		case http.MethodGet:
			getSnippetHandler(rw, r)
			return
		case http.MethodPost:
			createSnippetHandler(rw, r)
			return
		default:
			rw.WriteHeader(http.StatusNotFound)
			return
		}
	})

	fs := http.FileServer(http.Dir("./frontend/public"))
	r.Handle("/", http.StripPrefix("/", fs))
	r.HandleFunc(editPrefix, func(rw http.ResponseWriter, r *http.Request) {
		splitPath := strings.SplitAfter(r.URL.Path, "/")
		prefix := ""
		for i := 0; i < 3 && i < len(splitPath); i++ {
			prefix += splitPath[i]
		}
		http.StripPrefix(prefix, fs).ServeHTTP(rw, r)
	})
	// r.Handle(editPrefix, http.StripPrefix(editPrefix, fs))

	s.httpServer = &http.Server{
		Addr:    s.listenAddress,
		Handler: r,
	}

	log.Printf("http server listening on %s", s.listenAddress)

	if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		if err != http.ErrServerClosed {
			return err
		}
	}

	return nil
}

// Stop stops the HTTP server.
func (s *httpService) Stop() {
	if s != nil {
		_ = s.httpServer.Close()
	}
}
