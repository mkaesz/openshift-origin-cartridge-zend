<?php
return array(
    'modules' => array(
        'Application',
        'ZendServer',
        'WebAPI',
        'Audit',
    	'Cache',
        'ZendDeployment',
    	'Deployment',
    	'Monitor',
    	'Statistics',
    	'Configuration',
    	'StudioIntegration',
    	'JobQueue',    		
    	'Codetracing',
    	'PageCache',
    	'GuidePage',
    	'Michelf', /// markdown parser
    ),
    'module_listener_options' => array(
        'config_glob_paths' => array(
        	get_cfg_var('zend.conf_dir').DIRECTORY_SEPARATOR.'zend_database.ini',
            ZEND_SERVER_GUI_PATH. '/config/autoload/{,*.}{global,local}.config.php',
            ZEND_SERVER_GUI_PATH. '/config/zs_ui.ini',
            ZEND_SERVER_GUI_PATH. '/config/zs_ui_user.ini',
        	get_cfg_var('zend.conf_dir') . DIRECTORY_SEPARATOR . 'packaging.ini',
        ),
        'module_paths' => array(
            './module',
            './vendor',
        	'./3rdparty'
        ),
    ),
);
