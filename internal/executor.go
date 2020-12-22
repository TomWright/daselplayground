package internal

import (
	"errors"
	"fmt"
	"github.com/mattn/go-shellwords"
	"github.com/tomwright/daselplayground/internal/domain"
	"github.com/tomwright/daselplayground/internal/storage"
	"log"
	"os"
	"os/exec"
	"strings"
)

// VersionOpts defines options for a specific dasel version.
type VersionOpts struct {
	Version string
	Path    string
}

// NewExecutor returns an executor that can be used to run dasel commands.
func NewExecutor(snippetStore storage.SnippetStore) *Executor {
	return &Executor{
		versions:     map[string]*VersionOpts{},
		snippetStore: snippetStore,
	}
}

type Executor struct {
	versions     map[string]*VersionOpts
	snippetStore storage.SnippetStore
}

func (e *Executor) RegisterVersion(v *VersionOpts) {
	e.versions[v.Version] = v
}

var (
	ErrInvalidVersion = errors.New("invalid dasel version")
)

// Versions returns the set of available dasel versions.
func (e *Executor) Versions() []string {
	res := make([]string, len(e.versions))
	i := 0
	for version, _ := range e.versions {
		res[i] = version
		i++
	}
	return res
}

// ExecuteArgs define the opts to use when executing dasel commands.
type ExecuteArgs struct {
	Snippet *domain.Snippet
}

var restrictedArgs = []string{
	"-o", "--out", "update",
}

var argsParser = shellwords.NewParser()

// StringToArgs converts the given string into a list of arguments.
func StringToArgs(args string) ([]string, error) {
	parts, err := argsParser.Parse(args)
	if err != nil {
		return nil, err
	}
	return parts, nil
}

// Execute executes a dasel command.
func (e *Executor) Execute(args ExecuteArgs) (result string, daselErr error, validationErr error, err error) {
	versionOpts, ok := e.versions[args.Snippet.Version]
	if !ok {
		return "", nil, ErrInvalidVersion, nil
	}

	daselArgs, err := StringToArgs(args.Snippet.Args)
	if err != nil {
		return "", nil, nil, err
	}

	for _, a := range daselArgs {
		for _, restrictedArg := range restrictedArgs {
			if a == restrictedArg || strings.HasPrefix(a, restrictedArg+" ") || strings.HasPrefix(a, restrictedArg+"=") {
				daselErr := &RestrictedArgErr{Arg: a}
				if err := e.snippetStore.StoreExecution(args.Snippet, daselArgs, daselErr.Error(), false); err != nil {
					log.Printf("could not store unsuccessful snippet execution: %s", err)
				}

				return "", nil, daselErr, nil
			}
		}
	}

	echoCmd := exec.Command("echo", args.Snippet.Input)
	daselCmd := exec.Command(versionOpts.Path, daselArgs...)

	reader, writer, err := os.Pipe()
	if err != nil {
		return "", nil, nil, fmt.Errorf("could not get os pipe: %w", err)
	}

	echoCmd.Stdout = writer
	daselCmd.Stdin = reader

	if err := echoCmd.Start(); err != nil {
		return "", nil, nil, fmt.Errorf("could not start echo: %w", err)
	}

	errCh := make(chan error)

	go func() {
		defer close(errCh)
		if err := echoCmd.Wait(); err != nil {
			errCh <- fmt.Errorf("could not wait for echo: %w", err)
			return
		}
		if err := writer.Close(); err != nil {
			errCh <- fmt.Errorf("could not close echo stdout: %w", err)
			return
		}
	}()

	select {
	case err, ok := <-errCh:
		if ok {
			return "", nil, nil, err
		}
	}

	out, err := daselCmd.CombinedOutput()
	if err != nil {
		daselErr := fmt.Errorf("%w: %s", err, string(out))

		if err := e.snippetStore.StoreExecution(args.Snippet, daselArgs, daselErr.Error(), false); err != nil {
			log.Printf("could not store unsuccessful snippet execution: %s", err)
		}

		return "", daselErr, nil, nil
	}

	if err := e.snippetStore.StoreExecution(args.Snippet, daselArgs, string(out), true); err != nil {
		log.Printf("could not store successful snippet execution: %s", err)
	}

	return string(out), nil, nil, nil
}

type RestrictedArgErr struct {
	Arg string
}

func (e *RestrictedArgErr) Error() string {
	return fmt.Sprintf("restricted argument: %s", e.Arg)
}
