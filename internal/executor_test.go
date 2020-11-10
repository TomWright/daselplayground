package internal_test

import (
	"github.com/tomwright/daselplayground/internal"
	"reflect"
	"testing"
)

func testStringToArgs(in string, exp []string) func(t *testing.T) {
	return func(t *testing.T) {
		got := internal.StringToArgs(in)
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
}
