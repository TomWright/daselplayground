package internal

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
)

// VersionOpts defines options for a specific dasel version.
type VersionOpts struct {
	Version string
	Path string
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
	Version string
	FileType string
	File string
	Args []string
}

// Execute executes a dasel command.
func (e *Executor) Execute(args ExecuteArgs) (string, error) {
	versionOpts, ok := e.versions[args.Version]
	if !ok {
		return "", ErrInvalidVersion
	}

	daselArgs := append([]string{
		"-p", args.FileType,
	}, args.Args...)

	fmt.Println(daselArgs)

	echoCmd := exec.Command("echo", args.File)
	daselCmd := exec.Command(versionOpts.Path, daselArgs...)

	reader, writer, err := os.Pipe()
	if err != nil {
		return "", fmt.Errorf("could not get os pipe: %w", err)
	}

	echoCmd.Stdout = writer
	daselCmd.Stdin = reader

	if err := echoCmd.Start(); err != nil {
		fmt.Println("here1", err)
		return "", fmt.Errorf("could not start echo: %w", err)
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
			fmt.Println("here", err)
			return "", err
		}
	}

	out, err := daselCmd.CombinedOutput()
	if err != nil {
		fmt.Println("here2", err, string(out))
		return "", fmt.Errorf("could not get dasel output: %w", err)
	}

	fmt.Println("got output", string(out))

	return string(out), nil
}
