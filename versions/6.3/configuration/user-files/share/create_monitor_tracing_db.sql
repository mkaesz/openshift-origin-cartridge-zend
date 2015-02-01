
CREATE TABLE IF NOT EXISTS `trace_files` (
	`id`              INTEGER NOT NULL UNIQUE PRIMARY KEY AUTOINCREMENT,
	`trace_id`        VARCHAR NOT NULL,
	`filepath`        VARCHAR NOT NULL,
	`host`            VARCHAR,
	`originating_url` VARCHAR,
	`final_url`       VARCHAR NOT NULL,
	`trace_size`      INTEGER NOT NULL,
	`reason`          INTEGER NOT NULL,
	`trace_time`      INTEGER NOT NULL,
	`node_id`         INTEGER,
	`app_id`          INTEGER NOT NULL	
);

CREATE INDEX IF NOT EXISTS TRACE_FILES_IDX1 on trace_files(app_id);
CREATE INDEX IF NOT EXISTS TRACE_FILES_IDX1_PATH on trace_files(filepath);
