<?php
/**
 * Global Configuration Override
 *
 * You can use this file for overridding configuration values from modules, etc.  
 * You would place values in here that are agnostic to the environment and not 
 * sensitive to security. 
 *
 * @NOTE: In practice, this file will typically be INCLUDED in your source 
 * control, so do not include passwords or other sensitive information in this 
 * file.
 */

return array(
	'acl' => array('zend_gui' => array('aclEnabled' => true)),
	'notifications' => array('zend_gui' => array('interval' => 5, 'lockUiOnRestart' => false, 'shortNotificationTime' => 7, 'longNotificationTime' => 7)),
	'authentication' => array('zend_gui' => array('simple' => true,'adapter' => '','groupsAttribute' => '')),
	'sessionControl' => array('zend_gui' => array('sessionControlEnabled' => true, 'sessionId' => 'ZS6SESSID')),
	'list' => array('zend_gui' => array('resultsPerPage' => 20)),
	'timezone' => array('zend_gui' => array('timezone' => '')),
	'bootstrap' => array('zend_gui' => array('completed' => true, 'requireEula' => true)),
	'debugMode' => array('zend_gui' => array('debugModeEnabled' => false)),
	'logReader' => array('zend_gui' => array('defaultLineChunk' => '200', 'maxLineChunk' => '10000')),
	'logging' => array('zend_gui' => array('logVerbosity' => 'NOTICE')),
	'license' => array('zend_gui' => array('extra' => '', 'uniqueId' => '')),
	'logout' => array('zend_gui' => array('timeout' => 15)),
	'feedback' => array('zend_gui' => array('email' => 'server6feedback@zend.com')),
	'deployment' => array('zend_gui' => array('defaultServer' => '', 'updateUrl' => 'http://updates.zend.com/libraries/')),
	'package' => array('zend_gui' => array(
			'zs_upgrade' => 1,
			'edition' => 'zs',
			'version' => '6.0.0',
			'build' => 'trunk:67340',
			'serverProfile' => '',
			'trialExtended' => 0,
			'guidePage' => 1,
	)),
	'monitor' => array('zend_gui' => array(
			'defaultEmail' => '',
			'defaultCustomAction' => '',
	)),
	'mail' => array('zend_gui' => array(
		'mail_type' => 'smtp',
		'mail_host' => '',
		'mail_port' => '',
		'return_to_address' => '',
		'authentication_method' => '',
		'authentication' => 1,
		'mail_service' => 'custom',
		'mail_ssl' => '',
		'mail_username' => '',
		'mail_password' => '',
		'templatePath' => 'data/email-templates',
	)),
	'user' => array('zend_gui' => array(
		'adminUser' => 'admin',
		'devUser' => 'developer',
		'usernameLengthMin' => '4',
		'usernameLengthMax' => '20',
		'passwordLengthMin' => '4',
		'passwordLengthMax' => '20',
	)),
	'studioIntegration' => array('zend_gui' => array(
		'studioHost' => '',
		'studioPort' => '10137',
		'studioUseSsl' => '0',
		'alternateDebugServer' => '',
		'studioAutoDetectionEnabled' => '1',
		'studioAutoDetection' => '1',
		'studioAutoDetectionPort' => '20080',
		'studioClientTimeout' => 4000
	)),
	'zend_server_authentication' => array('zend_gui' => array(
		'host' => '',
		'port' => '',
		'useSsl' => '',
		'useStartTls' => '',
		'username' => '',
		'password' => '',
		'baseDn' => '',
		'accountCanonicalForm' => '',
		'accountDomainName' => '',
		'accountDomainNameShort' => '',
		'bindRequiresDn' => '',
	)),
	'installation' => array('zend_gui' => array(
			'defaultPort' => 10081,
			'securedPort' => 10082,
			'enginePort' => 10083,
	)),
	'profiles' => array(
		'productionDirectives'=>array(
			'ZEND' 		=> array('zend_debugger.allow_hosts'=>'127.0.0.0/8', 'zend.monitor_generate_unique_events' => '0', 'zend_monitor.event_generate_trace_file' => 0, 'zend_codetracing.buffer_size' => '1M'),
			'GUI' 		=> array('serverProfile'=>'Production'),
			'PHP_53' 	=> array('error_reporting'=>'E_ALL & ~E_DEPRECATED', 'html_errors' => 'Off'),
			'PHP_54' 	=> array('error_reporting'=>'E_ALL & ~E_DEPRECATED & ~E_STRICT', 'html_errors' => 'On'),
			'PHP_ALL'	=> array(
				'display_errors' => 'Off',
				'display_startup_errors' => 'Off',
				'track_errors' => 'Off',			
				'mysqlnd.collect_memory_statistics' => 'Off',				
				'session.bug_compat_42' => 'Off',
				'session.bug_compat_warn' => 'Off',
			),		
		),
		'developmentDirectives'=>array(
				'ZEND' 		=> array('zend_codetracing.buffer_size'=>'5M', 'zend.monitor_generate_unique_events'=>'1', 'zend_monitor.event_generate_trace_file'=>1, 'zend_codetracing.buffer_size' => '5M'),
				'GUI' 		=> array('serverProfile'=>'Development'),
				'PHP_53' 	=> array('error_reporting'=>'E_ALL | E_STRICT', 'html_errors' => 'On'),
				'PHP_54' 	=> array('error_reporting'=>'E_ALL', 'html_errors' => 'On'),
				'PHP_ALL'	=> array(
						'display_errors' => 'On',
						'display_startup_errors' => 'On',
						'track_errors' => 'On',					
						'mysqlnd.collect_memory_statistics' => 'On',
						'session.bug_compat_42' => 'On',
						'session.bug_compat_warn' => 'On',
				),
		),
	),
	'export'=> array(
			'directivesBlacklist'=>array(
					// Global directives
					'zend.serial_number',
					'zend.user_name',
					'zend.node_id',
						
					// SC directives
					'zend_sc.network.hostname',
					'zend_sc.allowed_hosts',
					'zend_sc.ha.cluster_members',
	
					// zend.database directives
					'zend.database.type',
					'zend.database.name',
					'zend.database.host_name',
					'zend.database.port',
					'zend.database.user',
					'zend.database.password',
	
					// debugger
					'zend_debugger.allow_hosts',
					'zend_debugger.deny_hosts',
						
					// GUI directives
					'zend_gui.defaultServer',
	
			)
	),
);