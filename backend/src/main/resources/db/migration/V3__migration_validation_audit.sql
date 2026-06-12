CREATE TABLE IF NOT EXISTS schema_migration_validations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    validation_key VARCHAR(120) NOT NULL,
    run_status VARCHAR(20) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    summary TEXT NULL,
    PRIMARY KEY (id),
    KEY idx_schema_migration_validations_started_at (started_at),
    KEY idx_schema_migration_validations_status (run_status)
);
