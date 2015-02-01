<?php
namespace ZendServerGateway\Framework;

use Zend\Mvc\MvcEvent;
// use Zend\Mvc\Application;
// use Zend\Mvc\Router;

class ConfigurationListener
{
    public function __invoke(MvcEvent $e)
    {
        $app = $e->getParam('application');
        $sm = $app->getServiceManager();

        $config = $app->getServiceManager()->get('configuration');

        /* @var $gateway \ZendServerGateway\ZendServerGateway */
        $gateway = $sm->get('ZendServerGateway');
        
        if (isset($config['zend_server_gateway']['configs']) && is_array($config['zend_server_gateway']['configs'])) {
            foreach ($config['zend_server_gateway']['configs'] as $gwConfig) {
                $gateway->configure($gwConfig);                
            }
        }
        
    }
}