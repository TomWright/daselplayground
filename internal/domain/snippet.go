package domain

type Snippet struct {
	ID      string `json:"id"`
	Input   string `json:"input"`
	Args    string `json:"args"`
	Version string `json:"version"`
}
