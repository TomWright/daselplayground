package domain

type Snippet struct {
	ID       string `json:"id"`
	File     string `json:"file"`
	FileType string `json:"fileType"`
	Args     []*Arg `json:"args"`
	Version  string `json:"version"`
}

type Arg struct {
	Name     string `json:"name"`
	Value    string `json:"value"`
	HasValue bool   `json:"hasValue"`
}
