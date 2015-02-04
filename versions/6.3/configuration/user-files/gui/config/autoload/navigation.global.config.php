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
    'navigation' => array(
    		'default' => array(
    				'overview' => array(
    						'label' => 'Overview',
    						'route' => 'home',
    						'pages' => array(
    							array(
    								'label' => 'Dashboard',
    								'controller' => 'Dashboard',
    								'route' => 'home/dashboard'
    							),
    							array(
	    							'label' => 'Events',
	    							'controller' => 'IssueList',
	    							'route' => 'default',
    							),
    							array(
	    							'label' => 'Code Tracing',
	    							'controller' => 'CodeTracing',
	    							'route' => 'default',
    							),
    							array(
	    							'label' => 'Job Queue',
	    							'controller' => 'JobQueue',
	    							'action' => 'index',
	    							'route' => 'default',
    							),
    							array(
    								'label' => 'Server Info',
    								'controller' => 'ServerInfo', 
    								'route' => 'default',
    							),
    							array(
    								'label' => 'Logs',
    								'controller' => 'Logs', 
    								'route' => 'default',
    							),
    							array(
    								'label' => 'Guide Page',
    								'controller' => 'GuidePage',
    								'action' => 'index',
    								'route' => 'home/guidepage',
    							),
    						)
    				),
    				'applications' => array(
    						'label' => 'Applications',
    						'controller' => 'Deployment',
    						'route' => 'default',
    						'pages' => array(
    								array(
    										'label' => 'Apps',
    										'controller' => 'Deployment', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Virtual Hosts',
    										'controller' => 'Vhost',
    										'action' => 'index',
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Libraries',
    										'controller' => 'DeploymentLibrary',
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Monitoring Rules',
    										'controller' => 'MonitorRules', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Caching Rules',
    										'controller' => 'PageCache', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Job Rules',
    										'controller' => 'RecurringJobs',
    										'route' => 'default',
    								),
    						),
    				),
    				'configurations' => array(
    						'label' => 'Configurations',
    						'controller' => 'ZendComponents',
    						'route' => 'default',
    						'pages' => array(
		    						array(
		    								'label' => 'Components',
		    								'controller' => 'ZendComponents',
		    								'route' => 'default',
		    						),
    								array(
    										'label' => 'PHP',
    										'controller' => 'Extensions', 
    										'action' => 'phpExtensions', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Studio Integration',
    										'controller' => 'StudioIntegration', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Monitor',
    										'controller' => 'ZendMonitor', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Session Clustering',
    										'controller' => 'SessionClustering', 
    										'route' => 'default',
    								),
    						),
    				),
    				'administration' => array(
    						'label' => 'Administration',
    						'controller' => 'Servers',
    						'route' => 'default',
    						'pages' => array(
		    						array(
		    								'label' => 'Servers',
		    								'controller' => 'Servers', 
		    								'route' => 'default',
		    						),
		    						array(
		    								'label' => 'Audit Trail',
		    								'controller' => 'Audit',
		    								'route' => 'default',
		    						),
    								array(
    										'label' => 'Users',
    										'controller' => 'Users', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Web API',
    										'controller' => 'ApiKeys', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'License',
    										'controller' => 'License', 
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Settings',
    										'controller' => 'Settings',
    										'route' => 'default',
    								),
    								array(
    										'label' => 'Import/Export',
    										'controller' => 'ImportExport', 
    										'route' => 'default',
    								),
    						)
    				)
    		),
    ),
    
);
