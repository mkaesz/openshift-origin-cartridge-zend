<?php

namespace ZendServerGateway\Controller;

use Zend\Mvc\Controller\AbstractRestfulController as BaseAbstractRestfulController;
use Zend\Stdlib\RequestInterface as Request;
use Zend\Mvc\Exception;

abstract class AbstractRestfulController extends BaseAbstractRestfulController
{
    /**
     * Process post data and call create
     *
     * @param Request $request
     * @return mixed
     */
    public function processPostData(Request $request)
    {
        /** @var $parameterData ParameterDataContainer */
        $parameterData = $this->getEvent()->getParam('ZendServerGatewayParameterData');

        if ($parameterData) {
            $data = $parameterData->getBodyParams();
            return $this->create($data);
        }

        return parent::processPostData($request);
    }

    /**
     * Process put data and call update
     *
     * @param Request $request
     * @param $routeMatch
     * @return mixed
     * @throws Exception\DomainException
     */
    public function processPutData(Request $request, $routeMatch)
    {
        $id = $this->getIdentifier($routeMatch, $request);
        if (!$id) {
            throw new Exception\DomainException('Missing identifier');
        }

        /** @var $parameterData ParameterDataContainer */
        $parameterData = $this->getEvent()->getParam('ZendServerGatewayParameterData');

        if ($parameterData) {
            $data = $parameterData->getBodyParams();
            return $this->update($id, $data);
        }

        $data = $this->processBodyContent($request);
        return $this->update($id, $data);
    }
}
