package main

import (
	"context"
	"github.com/tomwright/daselplayground/internal"
	"github.com/tomwright/lifetime"
)

func main() {
	executor := internal.NewExecutor()

	executor.RegisterVersion(&internal.VersionOpts{
		Version: "v1.1.0",
		Path:    "dasel",
	})

	httpService := internal.NewHTTPService(":8090", executor)

	lt := lifetime.New(context.Background()).Init()

	// Start the http service.
	lt.Start(httpService)

	// Wait for all routines to stop running.
	lt.Wait()
}
