CREATE TABLE IF NOT EXISTS  stats_browsers_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		name varchar(64) NOT NULL,
		version varchar(64),	
		user_agent_string varchar(128)
		);
		
CREATE TABLE IF NOT EXISTS  stats_os_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		name varchar(128) NOT NULL,
		version varchar(64),		
		user_agent_string varchar(128),
		mobile BIT DEFAULT 0
		);
		
CREATE TABLE IF NOT EXISTS  stats_geo_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		code varchar(8) UNIQUE NOT NULL,
		name varchar(128) NOT NULL
		);
		
CREATE TABLE IF NOT EXISTS  stats_daily( 
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		entry_type_id      integer,
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128), 
		namespace          varchar(128), 
		samples            integer
		);

CREATE TABLE IF NOT EXISTS  stats_monthly( 
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		entry_type_id      integer, 
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128), 
		namespace          varchar(128), 
		samples            integer
		);
		
CREATE TABLE IF NOT EXISTS  stats_weekly( 
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
		entry_type_id      integer, 
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128),
		namespace          varchar(128), 		
		samples            integer
		);
		
CREATE TABLE IF NOT EXISTS  schema_properties (
		name varchar(128) NOT NULL PRIMARY KEY,
		value varchar(128)
		);
		
CREATE INDEX IF NOT EXISTS  IDX_DAILY_TYPE_FROM on stats_daily (entry_type_id, from_time);
CREATE INDEX IF NOT EXISTS  IDX_DAILY_FROM_NODE on stats_daily (from_time, node_id);
CREATE INDEX IF NOT EXISTS  IDX_WEEKLY_TYPE_FROM on stats_weekly (entry_type_id, from_time);
CREATE INDEX IF NOT EXISTS  IDX_WEEKLY_FROM_NODE on stats_weekly (from_time, node_id);
CREATE INDEX IF NOT EXISTS  IDX_MONTHLY_TYPE_FROM on stats_monthly (entry_type_id, from_time);
CREATE INDEX IF NOT EXISTS  IDX_MONTHLY_FROM_NODE on stats_monthly (from_time, node_id);
CREATE UNIQUE INDEX IF NOT EXISTS  IDX_BROWSERS_DICTIONARY_UNIQUE on stats_browsers_dictionary(name, version);
CREATE UNIQUE INDEX IF NOT EXISTS  IDX_OS_DICTIONARY_UNIQUE on stats_os_dictionary(name, version);

INSERT OR IGNORE INTO schema_properties (name, value) VALUES ('version', '1.0.11');
