<?php

namespace ZendServerGateway\Framework;

use ZendServerGateway\ZendServerGateway;
use Zend\Mvc\MvcEvent;
use Zend\View\Model;
use Zend\Mvc\Router\RouteMatch;

class RenderListener
{
    protected $gateway;

    protected $options = array(
        'is_json' => null,
        'json_headers' => array(),
        'html_headers' => array(),
    );

    public function __construct(ZendServerGateway $gateway)
    {
        $this->gateway = $gateway;
    }

    public function __invoke(MvcEvent $event)
    {
        /** @var $response Http\Response */
        $response = $event->getResponse();

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

        $responseHeaders = $response->getHeaders();

        if ($error = $event->getError()) {
            $errorContent = array();

            switch ($error) {
                case 'not-authorized':
                    $response->setStatusCode(401);
                    $errorContent['status'] = 'Not Authorized';
                    break;
                case 'error-router-no-match':
                    $response->setStatusCode(404);
                    $errorContent['status'] = 'Not Found';
                    break;
                case 'invalid-input':
                    $response->setStatusCode(400);
                    $errorContent['status'] = 'Invalid Input';
                    $errorContent['messages'] = $event->getParam('input-error-messages');
                    break;
                case 'error-exception':
                default:
                    $response->setStatusCode(500);
                    $errorContent['status'] = 'An exception has occurred.';
            }
            if ($this->options['is_json'] || $event->getResult() instanceof Model\JsonModel) {
                $responseHeaders->addHeaderLine('Content-type', 'application/error+json');
                $response->setContent(json_encode($errorContent));
                $event->stopPropagation(true);
            }
        }

        $headerKey = ($this->options['is_json'] || $event->getResult() instanceof Model\JsonModel) ? 'json_headers' : 'html_headers';
        foreach ($this->options[$headerKey] as $header) {
            $responseHeaders->addHeaderLine($header['name'], $header['value']);
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
            if (isset($response['header']) && (!isset($response['type']) || $response['type'] == 'json')) {
                $this->options['json_headers'] = array_merge($this->options['json_headers'], $response['header']);
            }
            if (isset($response['header']) && (!isset($response['type']) || $response['type'] == 'html')) {
                $this->options['html_headers'] = array_merge($this->options['html_headers'], $response['header']);
            }
        }
    }


}