<?php

namespace ZendServerGateway\Controller\Plugin;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\Mvc\Controller\AbstractController;
use ZendServerGateway\Controller\ParameterDataContainer;

class BodyParam extends AbstractPlugin
{
    /**
     * Grabs a param from body match after content-negotiation
     *
     * @param string $param
     * @param mixed $default
     * @return mixed
     */
    public function __invoke($param = null, $default = null)
    {
        $controller = $this->getController();
        if ($controller instanceof AbstractController) {
            $parameterData = $controller->getEvent()->getParam('ZendServerGatewayParameterData');
            if ($parameterData instanceof ParameterDataContainer) {
                return $parameterData->getBodyParam($param, $default);
            }
        }

        return $controller->getRequest()->getPost($param, $default);
    }
}