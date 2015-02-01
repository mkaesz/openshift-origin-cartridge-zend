CREATE TABLE IF NOT EXISTS jobqueue_queue (
				id INTEGER NOT NULL UNIQUE  PRIMARY KEY AUTOINCREMENT,
				name varchar(32) NOT NULL UNIQUE,
				status INTEGER,
				max_http_jobs INTEGER,
				added_jobs INTEGER NOT NULL DEFAULT 0,
				served_jobs INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS jobqueue_application (
				id INTEGER NOT NULL UNIQUE  PRIMARY KEY AUTOINCREMENT,
				name varchar(32) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS jobqueue_job (
				id INTEGER NOT NULL UNIQUE  PRIMARY KEY AUTOINCREMENT,
				queue_id INTEGER NOT NULL,
				application_id INTEGER,
				type INTEGER NOT NULL,
				priority INTEGER NOT NULL,
				status INTEGER NOT NULL,
				predecessor INTEGER,
				persistent INTEGER,
				timeout INTEGER,
				schedule_time timestamp NULL DEFAULT NULL,
				schedule_id INTEGER,
				creation_time timestamp NULL DEFAULT NULL,
				start_time timestamp NULL DEFAULT NULL,
				end_time timestamp NULL DEFAULT NULL,
				name char(32),
				script varchar(4096) NOT NULL,
				vars text,
				http_headers text,
				output text,
				error text,
				node_id INTEGER,
				data_size INTEGER DEFAULT 0,
				options VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS jobqueue_schedule (
				id INTEGER NOT NULL UNIQUE  PRIMARY KEY AUTOINCREMENT,
				status INTEGER NOT NULL DEFAULT 0,
				queue_id INTEGER NOT NULL,
				application_id INTEGER,
				type INTEGER NOT NULL,
				priority INTEGER NOT NULL,
				persistent INTEGER,
				timeout INTEGER,
				schedule char(32),
				name char(32),
				script varchar(4096) NOT NULL,
				vars text,
				http_headers text,
				options VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS jobqueue_nodes_status (
				id INTEGER PRIMARY KEY AUTOINCREMENT, 
				node_id INTEGER UNIQUE,
				last_updated timestamp
);

CREATE TABLE IF NOT EXISTS `version` (
				key string primary key,
				version string
);

CREATE INDEX IF NOT EXISTS next_job ON jobqueue_job (
status,
priority
);

CREATE INDEX IF NOT EXISTS next_scheduled_job ON jobqueue_job (
status,
schedule_time,
priority
);

CREATE INDEX IF NOT EXISTS successors ON jobqueue_job (
predecessor
);

CREATE INDEX IF NOT EXISTS IDX_JOB_SCHEDULE_ID ON jobqueue_job (schedule_id ASC);
CREATE INDEX IF NOT EXISTS IDX_JOB_PRIORITY on jobqueue_job (priority);
CREATE INDEX IF NOT EXISTS IDX_JOB_START on jobqueue_job (start_time);
CREATE INDEX IF NOT EXISTS IDX_JOB_CREATION on jobqueue_job (creation_time);
CREATE INDEX IF NOT EXISTS IDX_JOB_SCRIPT on jobqueue_job(script);
CREATE INDEX IF NOT EXISTS IDX_JOB_APP on jobqueue_job(application_id);
CREATE INDEX IF NOT EXISTS IDX_JOB_NAME on jobqueue_job(name);
CREATE INDEX IF NOT EXISTS IDX_JOB_END on jobqueue_job(end_time);
CREATE INDEX IF NOT EXISTS IDX_JOB_CLEANUP on jobqueue_job(status, persistent, end_time);



INSERT OR IGNORE into version values('SCHEMA_VERSION', '1.0.12');

