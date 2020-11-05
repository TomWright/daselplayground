package internal

import (
	"errors"
	"fmt"
	"github.com/tomwright/daselplayground/internal/domain"
	"os"
	"os/exec"
)

// VersionOpts defines options for a specific dasel version.
type VersionOpts struct {
	Version string
	Path    string
}

// NewExecutor returns an executor that can be used to run dasel commands.
func NewExecutor() *Executor {
	return &Executor{
		versions: map[string]*VersionOpts{},
	}
}

type Executor struct {
	versions map[string]*VersionOpts
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

// Execute executes a dasel command.
func (e *Executor) Execute(args ExecuteArgs) (result string, daselErr error, err error) {
	versionOpts, ok := e.versions[args.Snippet.Version]
	if !ok {
		return "", nil, ErrInvalidVersion
	}

	daselArgs := make([]string, 0)
	if args.Snippet.FileType != "" {
		daselArgs = append(daselArgs, "-p", args.Snippet.FileType)
	}

	for _, a := range args.Snippet.Args {
		if a.HasValue {
			daselArgs = append(daselArgs, a.Name, a.Value)
		} else {
			daselArgs = append(daselArgs, a.Name)
		}
	}

	echoCmd := exec.Command("echo", args.Snippet.File)
	daselCmd := exec.Command(versionOpts.Path, daselArgs...)

	reader, writer, err := os.Pipe()
	if err != nil {
		return "", nil, fmt.Errorf("could not get os pipe: %w", err)
	}

	echoCmd.Stdout = writer
	daselCmd.Stdin = reader

	if err := echoCmd.Start(); err != nil {
		return "", nil, fmt.Errorf("could not start echo: %w", err)
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
			return "", nil, err
		}
	}

	out, err := daselCmd.CombinedOutput()
	if err != nil {
		daselErr := fmt.Errorf("%w: %s", err, string(out))
		return "", daselErr, nil
	}

	return string(out), nil, nil
}
