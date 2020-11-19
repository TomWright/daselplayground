ALTER TABLE snippet_executions
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT NOW(),
    ADD INDEX created_at (created_at);

UPDATE snippet_execitions SET created_at = NOW() WHERE created_at IS NULL;
