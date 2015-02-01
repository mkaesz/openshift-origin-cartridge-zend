<?php

namespace ZendServerGateway\Framework;

use ZendServerGateway\ZendServerGateway;
use Zend\View\Model;
use Zend\Mvc\Router\RouteMatch;

class ResultListener
{
    protected $gateway;

    protected $options = array(
        'is_json' => null
    );

    public function __construct(ZendServerGateway $gateway)
    {
        $this->gateway = $gateway;
    }

    public function __invoke(\Zend\Mvc\MvcEvent $event)
    {
        $result = $event->getResult();

        if ($result instanceof Model\ModelInterface) {
            return;
        }

        // check to see if there is a route specific response
        $routeMatch = $event->getRouteMatch();
        if ($routeMatch instanceof RouteMatch) {
            $routeParams = $routeMatch->getParam('_gateway');

            if ($routeParams && isset($routeParams['response'])) {
                $routeResponseOptions = $routeParams['response'];
                $this->parseOptions(array('response' => array($routeResponseOptions)));
            }
        }

        $configuration = $this->gateway->getConfiguration();
        $this->parseOptions($configuration);

        // apply options, first for the response type
        if ($this->options['is_json']) {
            if ($result instanceof \JsonSerializable) {
                $result = $result->jsonSerialize();
            }
            if (is_object($result)) {
                if (method_exists($result, 'toArray')) {
                    $result = $result->toArray();
                } else {
                    throw new \Exception('Responses must be an array or an object that implements JsonSerializable or has a method called toArray()');
                }
            }
            if ($result === null) {
                $result = array();
            }
            $result = new Model\JsonModel($result);
            $event->setViewModel($result);
            $event->setResult($result);
        }
    }

    protected function parseOptions(array $options)
    {
        foreach ($options['response'] as $response) {
            if ($this->options['is_json'] === null) {
                if (isset($response['type']) && $response['type'] == 'json' && isset($response['default'])) {
                    $this->options['is_json'] = ($response['default'] != 'false') ? true : false;
                }
            }
        }
    }
}