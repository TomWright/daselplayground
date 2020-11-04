package internal

import (
	"log"
	"net/http"
)

// NewHTTPService returns a service that can be used to start a http server
// that will generate diagrams.
func NewHTTPService(listenAddress string, executor *Executor) *httpService {
	return &httpService{
		listenAddress: listenAddress,
		executor:      executor,
	}
}

// httpService is a service that can be used to start a http server
// that will generate diagrams.
type httpService struct {
	listenAddress string
	httpServer    *http.Server
	executor      *Executor
}

// Start starts the HTTP server.
func (s *httpService) Start() error {
	r := http.NewServeMux()
	r.HandleFunc("/", editHTTPHandler(s.executor))
	r.HandleFunc(editPrefix, editHTTPHandler(s.executor))
	r.HandleFunc("/versions", versionsHTTPHandler(s.executor))
	r.HandleFunc("/execute", executeHTTPHandler(s.executor))

	fs := http.FileServer(http.Dir("./internal/frontend/assets"))
	r.Handle("/assets/", http.StripPrefix("/assets/", fs))

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
