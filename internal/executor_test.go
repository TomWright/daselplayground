package internal_test

import (
	"github.com/tomwright/daselplayground/internal"
	"reflect"
	"testing"
)

func testStringToArgs(in string, exp []string) func(t *testing.T) {
	return func(t *testing.T) {
		got, err := internal.StringToArgs(in)
		if err != nil {
			t.Errorf("unexpected error: %s", err)
			return
		}
		if !reflect.DeepEqual(exp, got) {
			t.Errorf("expected [%d] %v, got [%d] %v", len(exp), exp, len(got), got)
		}
	}
}

func TestStringToArgs(t *testing.T) {
	t.Run("Simple", testStringToArgs(`-p json .names`, []string{"-p", "json", ".names"}))
	t.Run("SingleQuote", testStringToArgs(`-p json '.names'`, []string{"-p", "json", ".names"}))
	t.Run("DoubleQuote", testStringToArgs(`-p json ".names"`, []string{"-p", "json", ".names"}))
	t.Run("SingleQuoteWithBracketsAndQuotes", testStringToArgs(`-p json '.names(name="Tom")'`, []string{"-p", "json", `.names(name="Tom")`}))
	t.Run("SingleQuoteWithSpaces", testStringToArgs(`-p json '.names(   )'`, []string{"-p", "json", `.names(   )`}))
	t.Run("EnvNotProcessed", testStringToArgs(`-p json $SHELL`, []string{"-p", "json", `$SHELL`}))
	t.Run("BackticksNotProcessed", testStringToArgs("-p json `echo $SHELL`", []string{"-p", "json", "`echo $SHELL`"}))
}
