<?php

namespace ZendServerGateway\Controller\Plugin;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\Mvc\Controller\AbstractController;
use ZendServerGateway\Controller\ParameterDataContainer;

/**
 * @category   Zend
 * @package    Zend_Mvc
 * @subpackage Controller
 */
class QueryParam extends AbstractPlugin
{
    /**
     * Grabs a param from route match by default.
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
                return $parameterData->getQueryParam($param, $default);
            }
        }

        return $this->getController()->getRequest()->getQuery($param, $default);
    }

}
