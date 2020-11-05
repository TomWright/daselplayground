package main

import (
	"context"
	"github.com/tomwright/daselplayground/internal"
	"github.com/tomwright/daselplayground/internal/storage"
	"github.com/tomwright/lifetime"
	"os"
	"strings"
)

func main() {
	executor := internal.NewExecutor()
	snippetStore := storage.NewInMemorySnippetStore()

	for _, build := range strings.Split(os.Getenv("DASEL_BUILDS"), ",") {
		split := strings.Split(build, ":")
		executor.RegisterVersion(&internal.VersionOpts{
			Version: split[0],
			Path:    split[1],
		})
	}

	httpService := internal.NewHTTPService(os.Getenv("HTTP_LISTEN_ADDRESS"), executor, snippetStore)

	lt := lifetime.New(context.Background()).Init()

	// Start the http service.
	lt.Start(httpService)

	// Wait for all routines to stop running.
	lt.Wait()
}
