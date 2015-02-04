
	CREATE TABLE IF NOT EXISTS backtraces (
		id INTEGER NOT NULL  PRIMARY KEY AUTOINCREMENT,
		event_id INTEGER NOT NULL,
		depth INTEGER NOT NULL default '0',
		class_name text,
		object_name text,
		function_name text,
		static_call INTEGER NOT NULL,
		source_file text,
		line INTEGER NOT NULL default '0'
	);

	CREATE TABLE IF NOT EXISTS event_attribute_types (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  type_name text NOT NULL
	);


	CREATE TABLE IF NOT EXISTS event_attributes (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  event_id INTEGER NOT NULL,
	  attribute_id INTEGER NOT NULL,
	  value_str text
	);


	CREATE TABLE IF NOT EXISTS event_types (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  type_name text NOT NULL
	);


	CREATE TABLE IF NOT EXISTS events (
	  event_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  issue_id INTEGER NOT NULL,
	  request_id INTEGER NOT NULL,
	  script_id INTEGER NOT NULL,
	  event_type INTEGER NOT NULL,
	  severity INTEGER NOT NULL,
	  agg_key varchar(32) NOT NULL,
	  repeats INTEGER NOT NULL,
	  first_timestamp INTEGER NOT NULL,
	  last_timestamp INTEGER NOT NULL,
	  agg_hint text,
	  extra_data text,
	  tracer_event_num INTEGER NOT NULL default '-1',
	  tracer_dump_file text,
	  node_id INTEGER,
	  cluster_issue_id INTEGER NOT NULL,
	  app_id INTEGER NOT NULL default -1
	);

	CREATE TABLE IF NOT EXISTS cluster_issues (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  agg_key varchar(32) NOT NULL UNIQUE
	);

	CREATE TABLE IF NOT EXISTS func_args (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  event_id INTEGER NOT NULL,
	  argno INTEGER zerofill NOT NULL,
	  argvalue text
	);
	
	CREATE TABLE IF NOT EXISTS request_components (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		cluster_issue_id INTEGER NOT NULL,
		comp_name varchar(128) NOT NULL,
		comp_value varchar(128)
	);

	CREATE TABLE IF NOT EXISTS requests (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  host INTEGER zerofill NOT NULL,
	  https INTEGER zerofill default NULL,
	  full_url text,
	  get text,
	  post text,
	  cookie text,
	  var_server text,
	  session text,
	  uri text,
	  raw_post_data text,
	  files text,
	  env text
	);


	CREATE TABLE IF NOT EXISTS scripts (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  script_name text
	);

	CREATE TABLE IF NOT EXISTS vhosts (
	  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	  vhost_name text NOT NULL
	);

	CREATE TABLE IF NOT EXISTS matched_rules (
	  event_id INTEGER NOT NULL PRIMARY KEY,
	  id INTEGER NOT NULL,
	  rule_name text,
	  rule_description text
	);

	CREATE TABLE IF NOT EXISTS event_tags (
	  event_id INTEGER NOT NULL PRIMARY KEY,
	  tag text
	);
	
	CREATE TABLE IF NOT EXISTS event_actions(
	  event_id INTEGER NOT NULL PRIMARY KEY,
	  url varchar(256) DEFAULT NULL,
	  email varchar(128) DEFAULT NULL
	);

	CREATE TABLE IF NOT EXISTS issues (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		agg_key varchar(32) NOT NULL,
		node_id INTEGER,
		rule_name text NOT NULL,
		event_type INTEGER NOT NULL,
		severity INTEGER NOT NULL,
		repeats INTEGER NOT NULL,
		first_timestamp INTEGER NOT NULL,
		last_timestamp INTEGER NOT NULL,
		agg_hint text,
		full_url text NOT NULL,
		function_name text,
		file_name text,
		line INTEGER,
		events_per_hour INTEGER NOT NULL default '0',
		status INTEGER NOT NULL,
		cluster_issue_id INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS version (
		key string primary key,
		version string
	);

	CREATE TABLE IF NOT EXISTS request_uid_to_event_id (
		request_id_str TEXT,
		request_id INTEGER,
		event_id   INTEGER,
		last_updated INTEGER
	);
	
	CREATE INDEX IF NOT EXISTS REQUEST_UID_TO_EVENT_ID_IDX1 on request_uid_to_event_id(request_id_str);
	CREATE INDEX IF NOT EXISTS REQUEST_UID_TO_EVENT_ID_IDX2 on request_uid_to_event_id(request_id);
	CREATE INDEX IF NOT EXISTS REQUEST_UID_TO_EVENT_ID_IDX3 on request_uid_to_event_id(last_updated);
	
	CREATE INDEX IF NOT EXISTS REQUEST_COMPONENTS_IDX on request_components(comp_value);
	CREATE INDEX IF NOT EXISTS REQUEST_COMPONENTS_IDX2 on request_components(cluster_issue_id);
	
	CREATE INDEX IF NOT EXISTS RULE_NAME_IDX on ISSUES(rule_name);
	CREATE INDEX IF NOT EXISTS EVENT_TYPE_IDX on ISSUES(event_type);
	CREATE INDEX IF NOT EXISTS BACKTRACES_EVENT_ID_IDX on BACKTRACES(event_id);
	CREATE INDEX IF NOT EXISTS FUNCARGS_EVENT_ID_IDX on FUNC_ARGS(event_id);
	CREATE INDEX IF NOT EXISTS EVENT_ATTRIBUTES_EVENT_ID_IDX ON EVENT_ATTRIBUTES(event_id);
	CREATE INDEX IF NOT EXISTS EVENT_FIRST_TIMESTAMP_IDX ON EVENTS(first_timestamp);
	CREATE INDEX IF NOT EXISTS EVENT_LAST_TIMESTAMP_IDX ON EVENTS(last_timestamp);
	
	CREATE INDEX IF NOT EXISTS EVENTS_ISSUE_ID_IDX on EVENTS (issue_id);
	CREATE INDEX IF NOT EXISTS EVENTS_REQUEST_ID on EVENTS (request_id);
	CREATE INDEX IF NOT EXISTS ISSUES_NODE_ID_STATUS_IDX on ISSUES (node_id, status);
	CREATE INDEX IF NOT EXISTS ISSUES_CLUSTER_ISSUE_ID_SEVERITY_IDX ON ISSUES (cluster_issue_id, severity);
	CREATE INDEX IF NOT EXISTS EVENTS_CLUSTER_ISSUE_ID_NODE_LAST_IDX ON EVENTS (cluster_issue_id, node_id, last_timestamp);
	CREATE INDEX IF NOT EXISTS EVENTS_APP_ID_IDX on EVENTS (app_id);
	CREATE INDEX IF NOT EXISTS EVENTS_STATS_IDX on EVENTS (node_id, last_timestamp);
	
	INSERT OR IGNORE INTO version VALUES('SCHEMA_VERSION', '1.0.10');
	