CREATE TABLE snippet_executions (
    id VARCHAR(36) PRIMARY KEY,
    snippet_id VARCHAR(36),
    input TEXT,
    args VARCHAR(255),
    version VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT NOW(),
    parsed_args JSON,
    output TEXT,
    successful BOOL,
    INDEX created_at (created_at),
    INDEX snippet_id (snippet_id),
    INDEX successful (successful)
);
