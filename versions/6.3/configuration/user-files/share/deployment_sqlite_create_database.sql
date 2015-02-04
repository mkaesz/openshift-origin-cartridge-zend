CREATE TABLE IF NOT EXISTS deployment_packages (
                package_id INTEGER PRIMARY KEY AUTOINCREMENT,
				path VARCHAR(4096),
				eula TEXT,
				readme TEXT,
				logo TEXT,
				package_descriptor TEXT,
				name VARCHAR(128) NOT NULL,
				version VARCHAR(128) NOT NULL,
				monitor_rules TEXT DEFAULT NULL,
				pagecache_rules TEXT DEFAULT NULL				
				);

CREATE TABLE IF NOT EXISTS deployment_package_data (
                package_data_id INTEGER PRIMARY KEY AUTOINCREMENT,
				package_id INTEGER,
				data LONGBLOB
				);

CREATE TABLE IF NOT EXISTS deployment_tasks_descriptors (
				task_descriptor_id INTEGER PRIMARY KEY AUTOINCREMENT,
				base_url VARCHAR(128),
				user_params VARCHAR(4096),
				zend_params VARCHAR(4096),
				package_id INTEGER,
				creation_time INTEGER,
				run_once_node_id INTEGER,
				status VARCHAR(32) NOT NULL
				);
				
CREATE TABLE IF NOT EXISTS deployment_tasks (
				task_id INTEGER PRIMARY KEY AUTOINCREMENT,
				group_id INTEGER,
				node_id INTEGER,
				type VARCHAR(32) NOT NULL,
				task_descriptor_id INTEGER,
				audit_id INTEGER DEFAULT 0		
				);

CREATE TABLE IF NOT EXISTS deployment_apps (
				app_id INTEGER PRIMARY KEY AUTOINCREMENT,
				base_url VARCHAR(128) NOT NULL UNIQUE,
				user_app_name VARCHAR(128) NOT NULL,
				is_defined INTEGER DEFAULT 0,
				vhost_id INTEGER NOT NULL DEFAULT -1
				);
				
CREATE TABLE IF NOT EXISTS deployment_apps_versions (
				app_version_id INTEGER PRIMARY KEY AUTOINCREMENT,
				app_id INTEGER,
				task_descriptor_id INTEGER UNIQUE,
				health_check_path VARCHAR(128),
				last_used INTEGER,
				creation_time INTEGER
				);

CREATE TABLE IF NOT EXISTS deployment_app_status (
				app_status_id INTEGER PRIMARY KEY AUTOINCREMENT,
				app_version_id INTEGER,
				status VARCHAR(32),
				node_id INTEGER,
				install_path VARCHAR(4096),
				last_message VARCHAR(1024),
				last_updated INTEGER,
				health_status VARCHAR(32),
				health_message VARCHAR(1024),
				next_status INTEGER DEFAULT -1,
				hidden BIT DEFAULT 0
				);
				
CREATE TABLE IF NOT EXISTS deployment_libs (
				lib_id INTEGER PRIMARY KEY AUTOINCREMENT,
				is_defined INTEGER DEFAULT 0
				);
				
CREATE TABLE IF NOT EXISTS deployment_libs_versions (
				lib_version_id INTEGER PRIMARY KEY AUTOINCREMENT,
				lib_id INTEGER,
				task_descriptor_id INTEGER UNIQUE,
				creation_time INTEGER,
				is_default INTEGER
				);

CREATE TABLE IF NOT EXISTS deployment_libs_status (
				lib_status_id INTEGER PRIMARY KEY AUTOINCREMENT,
				lib_version_id INTEGER,
				status VARCHAR(32),
				node_id INTEGER,
				install_path VARCHAR(4096),
				last_message VARCHAR(1024),
				last_updated INTEGER
				);
				
CREATE TABLE IF NOT EXISTS deployment_sequencer (
				id INTEGER PRIMARY KEY AUTOINCREMENT
				);
				
CREATE TABLE IF NOT EXISTS deployment_nodes_status (
				node_id INTEGER PRIMARY KEY,
				last_updated INTEGER,
				status VARCHAR(32)
				);
				
CREATE TABLE IF NOT EXISTS deployment_vhosts (
				deployment_vhosts_id INTEGER PRIMARY KEY AUTOINCREMENT,
				name VARCHAR(100),
				node_id INTEGER,
				path VARCHAR(4096)
				);
				
CREATE TABLE IF NOT EXISTS deployment_properties (
				name VARCHAR(100) NOT NULL PRIMARY KEY,
				value VARCHAR(1024)
				);

CREATE TABLE IF NOT EXISTS deployment_downloads (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				app_id INTEGER DEFAULT NULL,
				lib_id INTEGER DEFAULT NULL,
				url VARCHAR(4096) NOT NULL,
				extra_data TEXT,
				path VARCHAR(4096),
				status INTEGER,
				message VARCHAR(4096),
				total INTEGER,
				downloaded INTEGER,
				start_time INTEGER
);

CREATE TABLE IF NOT EXISTS deployment_apps_info (
				id INTEGER PRIMARY KEY,
				base_url VARCHAR(128),
				path VARCHAR(4096)		
);

CREATE TABLE IF NOT EXISTS deployment_libs_info (
				id INTEGER PRIMARY KEY,
				name VARCHAR(128) NOT NULL,
				path VARCHAR(128) UNIQUE,
				is_default integer  default 0,
				version VARCHAR(128) NOT NULL
);


CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_APP_STATUS_APP_VERSION_ID on deployment_app_status (app_version_id);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_APP_STATUS_STATUS on deployment_app_status (status);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_APP_STATUS_NEXT_STATUS on deployment_app_status (next_status);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_TASKS_DESCRIPTORS_BASE_URL on deployment_tasks_descriptors(base_url);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_TASKS_NODE_ID on deployment_tasks(node_id);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_APPS_VERSIONS_APP_ID on deployment_apps_versions(app_id);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_LIBS_VERSIONS_LIB_ID on deployment_libs_versions(lib_id);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_LIBS_STATUS_VERSION_ID on deployment_libs_status(lib_version_id);

CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_DOWNLOADS_APP on deployment_downloads(app_id);
CREATE INDEX IF NOT EXISTS IDX_DEPLOYMENT_DOWNLOADS_LIB on deployment_downloads(lib_id);

INSERT OR IGNORE INTO deployment_properties VALUES('SCHEMA_VERSION', '1.0.13');

