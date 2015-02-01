<?php

namespace ZendServerGateway;

use Zend\ModuleManager\ModuleManager;
use Zend\ModuleManager\Feature\AutoloaderProviderInterface;
use Zend\ModuleManager\Feature\ServiceProviderInterface;
use Zend\Mvc\ModuleRouteListener;
use Zend\Loader\AutoloaderFactory;
use Zend\Mvc\MvcEvent;

class Module implements AutoloaderProviderInterface, ServiceProviderInterface
{

    /**
     * @var ZendServerGateway
     */
    protected $gatewayService = null;

    public function getVersion()
    {
        return trim(file_get_contents(__DIR__ . '/../../VERSION.txt'));
    }

    public function init(ModuleManager $mm)
    {
        /* @var $me \Zend\ModuleManager\ModuleEvent */
        $me = $mm->getEvent();
        $sm = $me->getParam('ServiceManager');

        // setup autoloading
        $config = $sm->get('ApplicationConfig');

        if (isset($config['zend_server_gateway'])) {
            if (is_array($config['zend_server_gateway']['autoload'])) {
                AutoloaderFactory::factory(array('Zend\Loader\StandardAutoloader' => array('namespaces' => $config['zend_server_gateway']['autoload'])));
            }
        }

    }

    public function getAutoloaderConfig()
    {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
		            // if we're in a namespace deeper than one level we need to fix the \ in the path
                    __NAMESPACE__ => __DIR__ . '/../../src/' . str_replace('\\', '/' , __NAMESPACE__),
                ),
            ),
        );
    }
    
    public function getConfig()
    {
        return include __DIR__ . '/../../config/module.config.php';
    }

    /**
     * Setup the service configuration
     * 
     * @see \Zend\ModuleManager\Feature\ServiceProviderInterface::getServiceConfig()
     */
    public function getServiceConfig()
    {
        return array(
            'factories' => array(
                'ZendServerGateway' => function ($sm) {
                    /* @var $sm \Zend\ServiceManager\ServiceManager */
                    return new ZendServerGateway($sm->get('Application'));
                }
            )
        );
    }
    
    /**
     * Bootstrap time
     * 
     * @param MvcEvent $e
     */
    public function onBootstrap($e)
    {
        $app = $e->getApplication();
        $em = $app->getEventManager();
        $sem = $em->getSharedManager();
        $sm = $e->getApplication()->getServiceManager();

        // setup json strategy
        $strategy = $sm->get('ViewJsonStrategy');
        $view = $sm->get('ViewManager')->getView();
        $strategy->attach($view->getEventManager());

        // get the service
        $this->gatewayService = $sm->get('ZendServerGateway');

        // setup pre-route configuration
        $em->attach(MvcEvent::EVENT_ROUTE, new Framework\ConfigurationListener(), 100);

        // setup route listeners
        $em->attach(MvcEvent::EVENT_ROUTE, new Framework\AuthenticationListener($this->gatewayService), -70);
        $em->attach(MvcEvent::EVENT_ROUTE, new Framework\ContentNegotiationListener(), -99);
        $em->attach(MvcEvent::EVENT_ROUTE, new Framework\RouteValidationListener(), -100);

        // result listener, after dispatch
        $resultListener = new Framework\ResultListener($this->gatewayService);
        $em->attach(MvcEvent::EVENT_DISPATCH, $resultListener, -10);
        $sem->attach('Zend\Stdlib\DispatchableInterface', 'dispatch', $resultListener, -79);

        // render time listener
        $em->attach(MvcEvent::EVENT_RENDER, new Framework\RenderListener($this->gatewayService), -9000);
        
        // setup Module Route Listeners
        $eventManager        = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);
    }



}
