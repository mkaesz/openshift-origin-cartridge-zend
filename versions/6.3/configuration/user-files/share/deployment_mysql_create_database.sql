CREATE TABLE deployment_packages (
                package_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				path VARCHAR(4096),
				eula TEXT,
				readme TEXT,
				logo TEXT,
				package_descriptor TEXT,
				name VARCHAR(128) NOT NULL,
				version VARCHAR(128) NOT NULL,
				monitor_rules TEXT DEFAULT NULL,
				pagecache_rules TEXT DEFAULT NULL
				)ENGINE=MyISAM ;

CREATE TABLE deployment_package_data (
                package_data_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				package_id INTEGER NOT NULL,
				data LONGBLOB
				)ENGINE=MyISAM ;

CREATE TABLE deployment_tasks_descriptors (
				task_descriptor_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				base_url VARCHAR(128),
				user_params VARCHAR(4096),
				zend_params VARCHAR(4096),
				package_id INTEGER,
				creation_time INTEGER,
				run_once_node_id INTEGER,
				status VARCHAR(32) NOT NULL
				) ENGINE=MyISAM ;
				
CREATE TABLE deployment_tasks (
				task_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				group_id INTEGER,
				node_id INTEGER,
				type VARCHAR(32) NOT NULL,
				task_descriptor_id INTEGER,
				audit_id INTEGER DEFAULT 0
				) ENGINE=MyISAM ;

CREATE TABLE deployment_apps (
				app_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				base_url VARCHAR(128) NOT NULL UNIQUE,
				user_app_name VARCHAR(128) NOT NULL,
				is_defined INTEGER DEFAULT 0,
				vhost_id INTEGER NOT NULL DEFAULT -1
				) ENGINE=MyISAM;
				
CREATE TABLE IF NOT EXISTS deployment_apps_versions (
				app_version_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				app_id INTEGER,
				task_descriptor_id INTEGER UNIQUE,
				health_check_path VARCHAR(128),
				last_used INTEGER,
				creation_time INTEGER							
				) ENGINE=MyISAM;

CREATE TABLE deployment_app_status (
				app_status_id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
				) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS deployment_libs (
				lib_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				is_defined INTEGER DEFAULT 0
				) ENGINE=MyISAM;
				
CREATE TABLE IF NOT EXISTS deployment_libs_versions (
				lib_version_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				lib_id INTEGER,
				task_descriptor_id INTEGER UNIQUE,
				creation_time INTEGER,
				is_default INTEGER
				) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS deployment_libs_status (
				lib_status_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				lib_version_id INTEGER,
				status VARCHAR(32),
				node_id INTEGER,
				install_path VARCHAR(4096),
				last_message VARCHAR(1024),
				last_updated INTEGER
				) ENGINE=MyISAM;
				
CREATE TABLE deployment_sequencer (
				id INTEGER PRIMARY KEY AUTO_INCREMENT
				) ENGINE=MyISAM;

CREATE TABLE deployment_nodes_status (
				node_id INTEGER PRIMARY KEY,
				last_updated INTEGER,
				status VARCHAR(32)
				) ENGINE=MyISAM;
				
CREATE TABLE deployment_vhosts (
				deployment_vhosts_id INTEGER PRIMARY KEY AUTO_INCREMENT,
				name VARCHAR(100),
				node_id INTEGER,
				path VARCHAR(4096)				
				) ENGINE=MyISAM;

CREATE TABLE deployment_downloads (
				id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
				) ENGINE=MyISAM DEFAULT CHARSET=latin1;

				
CREATE INDEX IDX_DEPLOYMENT_APP_STATUS_APP_VERSION_ID on deployment_app_status (app_version_id);
CREATE INDEX IDX_DEPLOYMENT_APP_STATUS_STATUS on deployment_app_status (status);
CREATE INDEX IDX_DEPLOYMENT_APP_STATUS_NEXT_STATUS on deployment_app_status (next_status);
CREATE INDEX IDX_DEPLOYMENT_TASKS_DESCRIPTORS_BASE_URL on deployment_tasks_descriptors(base_url);
CREATE INDEX IDX_DEPLOYMENT_TASKS_NODE_ID on deployment_tasks(node_id);
CREATE INDEX IDX_DEPLOYMENT_APPS_VERSIONS_APP_ID on deployment_apps_versions(app_id);
CREATE INDEX IDX_DEPLOYMENT_LIBS_VERSIONS_LIB_ID on deployment_libs_versions(lib_id);
CREATE INDEX IDX_DEPLOYMENT_LIBS_STATUS_VERSION_ID on deployment_libs_status(lib_version_id);

CREATE INDEX IDX_DEPLOYMENT_DOWNLOADS_APP on deployment_downloads(app_id);
CREATE INDEX IDX_DEPLOYMENT_DOWNLOADS_LIB on deployment_downloads(lib_id);

INSERT IGNORE INTO schema_properties VALUES('DEPLOYMENT_SCHEMA_VERSION', '1.0.13');


