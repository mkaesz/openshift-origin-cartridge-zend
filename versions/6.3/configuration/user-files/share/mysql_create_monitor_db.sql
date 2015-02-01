
CREATE TABLE IF NOT EXISTS `backtraces` (
	`id` INTEGER NOT NULL  PRIMARY KEY AUTO_INCREMENT,
	`event_id` INTEGER NOT NULL,
	`depth` INTEGER NOT NULL default '0',
	`class_name` text,
	`object_name` text,  
	`function_name` text,
	`static_call` INTEGER NOT NULL,
	`source_file` text,
	`line` INTEGER NOT NULL default '0'
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `event_attribute_types` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `type_name` text NOT NULL
)ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS `event_attributes` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `event_id` INTEGER NOT NULL,
  `attribute_id` INTEGER NOT NULL,
  `value_str` BLOB
)ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS `event_types` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `type_name` text NOT NULL
)ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS `events` (
  `event_id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `issue_id` INTEGER NOT NULL,  
  `request_id` INTEGER NOT NULL,
  `script_id` INTEGER NOT NULL,
  `event_type` INTEGER NOT NULL,
  `severity` INTEGER NOT NULL,
  `agg_key` varchar(32) NOT NULL,
  `repeats` INTEGER NOT NULL,
  `first_timestamp` INTEGER NOT NULL,
  `last_timestamp` INTEGER NOT NULL,
  `agg_hint` text,
  `extra_data` text,
  `tracer_event_num` INTEGER NOT NULL,
  `tracer_dump_file` text,
  `node_id` INTEGER,
  `cluster_issue_id` INTEGER,
  `app_id` INTEGER NOT NULL default -1
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `func_args` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `event_id` INTEGER NOT NULL,
  `argno` INTEGER zerofill NOT NULL,
  `argvalue` text
)ENGINE=MyISAM;


CREATE TABLE IF NOT EXISTS `requests` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `host` INTEGER zerofill NOT NULL,
  `https` INTEGER zerofill default NULL,
  `full_url` text,
  `get` text,
  `post` text,
  `cookie` text,
  `var_server` text,
  `session` text,  
  `uri` text,
  `raw_post_data` text,
  `files` text,
  `env` text
)ENGINE=MyISAM DEFAULT CHARSET=latin1;


CREATE TABLE IF NOT EXISTS `scripts` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `script_name` text
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `vhosts` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `vhost_name` text NOT NULL
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `matched_rules` (
  `event_id` INTEGER NOT NULL PRIMARY KEY,
  `id` INTEGER NOT NULL,
  `rule_name` text,
  `rule_description` text
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `event_tags` (
  `event_id` INTEGER NOT NULL PRIMARY KEY,
  `tag` text
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `event_actions` (
	`event_id` INTEGER NOT NULL PRIMARY KEY,
	`url` varchar(256) DEFAULT NULL,
	`email` varchar(128) DEFAULT NULL
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `issues` (
	`id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`agg_key` varchar(32) NOT NULL,
	`node_id` INTEGER,
	`rule_name` varchar(256) NOT NULL,
	`event_type` INTEGER NOT NULL,
	`severity` INTEGER NOT NULL,
	`repeats` INTEGER NOT NULL,
	`first_timestamp` INTEGER NOT NULL,
	`last_timestamp` INTEGER NOT NULL,
	`agg_hint` text,
	`full_url` text NOT NULL,
	`function_name` text,
	`file_name` text,
	`line` INTEGER,
	`events_per_hour` INTEGER NOT NULL default '0',
	`status` INTEGER NOT NULL,
	`cluster_issue_id` INTEGER NOT NULL
)ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `request_components` (
	`id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`cluster_issue_id` INTEGER NOT NULL,
	`comp_name` varchar(128) NOT NULL,
	`comp_value` varchar(128)
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `cluster_issues` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `agg_key` varchar(32) UNIQUE NOT NULL 
)ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `trace_files` (
	`id` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`trace_id` VARCHAR(100) NOT NULL,
	`filepath` VARCHAR(512) NOT NULL,
	`host` VARCHAR(256),
	`originating_url` VARCHAR(512),
	`final_url` VARCHAR(512) NOT NULL,
	`trace_size` INTEGER NOT NULL,
	`reason` INTEGER NOT NULL,
	`trace_time` INTEGER NOT NULL,
	`node_id` INTEGER,
	`app_id`  INTEGER NOT NULL default -1,
	`event_id` INTEGER default -1
)ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `schema_properties` (
	property VARCHAR(100) NOT NULL primary key, 	
	property_value TEXT
) ENGINE=MyISAM;

CREATE TABLE IF NOT EXISTS `request_uid_to_event_id` (
	request_id_str VARCHAR(128),
	request_id INTEGER,
	event_id   INTEGER,
	last_updated INTEGER
) ENGINE=MyISAM;

CREATE INDEX REQUEST_UID_TO_EVENT_ID_IDX1 on `request_uid_to_event_id`(request_id_str);
CREATE INDEX REQUEST_UID_TO_EVENT_ID_IDX2 on `request_uid_to_event_id`(request_id);
CREATE INDEX REQUEST_UID_TO_EVENT_ID_IDX3 on `request_uid_to_event_id`(last_updated);
CREATE INDEX REQUEST_COMPONENTS_IDX on `request_components`(comp_value);
CREATE INDEX REQUEST_COMPONENTS_IDX2 on `request_components`(cluster_issue_id);

CREATE INDEX RULE_NAME_IDX on `issues`(rule_name);
CREATE INDEX EVENT_TYPE_IDX on `issues`(event_type);
CREATE INDEX BACKTRACES_EVENT_ID_IDX on `backtraces`(event_id);
CREATE INDEX FUNCARGS_EVENT_ID_IDX on `func_args`(event_id);
CREATE INDEX EVENT_ATTRIBUTES_EVENT_ID_IDX ON `event_attributes`(event_id);
CREATE UNIQUE INDEX CLUSTER_ISSUES_AGG_KEY_UNIQ_IDX ON `cluster_issues`(`agg_key`);
CREATE INDEX ISSUES_AGG_KEY on `issues`(agg_key);
CREATE INDEX ISSUES_STATUS_IDX on `issues`(status);

CREATE INDEX EVENTS_ISSUE_ID_IDX on `events` (issue_id);
CREATE INDEX EVENTS_REQUEST_ID on `events` (request_id);
CREATE INDEX ISSUES_NODE_ID_STATUS_IDX on `issues` (node_id, status);
CREATE INDEX ISSUES_CLUSTER_ISSUE_ID_SEVERITY_IDX ON `issues` (cluster_issue_id, severity);
CREATE INDEX EVENTS_CLUSTER_ISSUE_ID_NODE_LAST_IDX ON `events` (cluster_issue_id, node_id, last_timestamp);
CREATE INDEX TRACE_FILES_IDX1 on `trace_files`(app_id);
CREATE INDEX TRACE_FILES_IDX1_PATH on `trace_files`(filepath);

CREATE INDEX EVENTS_STATS_IDX on `events` (node_id, last_timestamp);

INSERT IGNORE INTO schema_properties VALUES('SCHEMA_VERSION', '1.0.10');
CREATE INDEX EVENTS_APP_ID_IDX on `events` (app_id);
