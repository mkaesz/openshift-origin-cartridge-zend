
CREATE TABLE stats_browsers_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		name varchar(64) NOT NULL,
		version varchar(64),	
		user_agent_string varchar(128)
		) ENGINE=MyISAM DEFAULT CHARSET=latin1;
		
CREATE TABLE stats_os_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		name varchar(128) NOT NULL,
		version varchar(64),	
		user_agent_string varchar(128),
		mobile INTEGER DEFAULT 0
		) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE stats_geo_dictionary (
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		code varchar(8) UNIQUE NOT NULL,
		name varchar(128) NOT NULL
		) ENGINE=MyISAM DEFAULT CHARSET=latin1;
		
CREATE TABLE stats_daily( 
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		entry_type_id      integer,
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128), 
		namespace          varchar(128), 
		samples            integer) ENGINE=MyISAM;

CREATE TABLE stats_monthly( 
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		entry_type_id      integer, 
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128),
		namespace          varchar(128), 		
		samples            integer) ENGINE=MyISAM;
		
CREATE TABLE stats_weekly( 
		id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, 
		entry_type_id      integer,
		entry_sub_type_id  integer,
		app_id             integer, 
		node_id            integer, 
		counter_value      float, 
		from_time          integer, 
		until_time         integer, 
		user_module        varchar(128),
		namespace          varchar(128), 		
		samples            integer) ENGINE=MyISAM;
		
INSERT INTO schema_properties (property, property_value) VALUES ('STATS_SCHEMA_VERSION', '1.0.11') ON DUPLICATE KEY update property=property;
		
CREATE INDEX IDX_DAILY_TYPE_FROM on stats_daily (entry_type_id, from_time);
CREATE INDEX IDX_DAILY_FROM_NODE on stats_daily (from_time, node_id);
CREATE INDEX IDX_WEEKLY_TYPE_FROM on stats_weekly (entry_type_id, from_time);
CREATE INDEX IDX_WEEKLY_FROM_NODE on stats_weekly (from_time, node_id);
CREATE INDEX IDX_MONTHLY_TYPE_FROM on stats_monthly (entry_type_id, from_time);
CREATE INDEX IDX_MONTHLY_FROM_NODE on stats_monthly (from_time, node_id);
CREATE UNIQUE INDEX IDX_BROWSERS_DICTIONARY_UNIQUE on stats_browsers_dictionary(name, version);
CREATE UNIQUE INDEX IDX_OS_DICTIONARY_UNIQUE on stats_os_dictionary(name, version);
