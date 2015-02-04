<?php
namespace ZendServerGateway\Framework;

use Zend\Mvc\MvcEvent;
use Zend\InputFilter;
use Zend\Http\Request;

class RouteValidationListener
{

    public function __invoke (MvcEvent $e)
    {
        /** @var $parameterData \ZendServerGateway\Controller\ParameterDataContainer */
        $parameterData = $e->getParam('ZendServerGatewayParameterData');

        $routeMatch = $e->getRouteMatch();
        $gwParams = $routeMatch->getParam('_gateway', false);
        
        if ($gwParams === false || !isset($gwParams['validation']) || !is_array($gwParams['validation'])) {
            // return early if nothing to do with this route
            return;
        }

        $request = $e->getRequest();
        if ($gwParams['gateway'] == 'resource' && ($request->isGet() || $request->isDelete())) {
            return;
        }

        $errorMessagesPerSource = $emptyErrorMessagesPerSource = array(
            'route' => array(),
            'query' => array(),
            'body'  => array()
        );

        foreach ($errorMessagesPerSource as $currentSource => &$errorMessages) {

            $validatorData = array();
            $validatorDataSources = array();

            $validation = $gwParams['validation'];

            $inputFilter = new InputFilter\InputFilter();
            foreach ($validation['param'] as $param) {

                if (!isset($param['source'])) {
                    $param['source'] = 'body';
                }

                if ($param['source'] != $currentSource) {
                    continue;
                }

                $validatorDataSources[$param['name']] = $param['source'];
                switch ($param['source']) {
                    case 'route':
                        if ($parameterData->hasRouteParam($param['name'])) {
                            $validatorData[$param['name']] = $parameterData->getRouteParam($param['name']);
                        }
                        break;
                    case 'query':
                        if ($parameterData->hasQueryParam($param['name'])) {
                            $validatorData[$param['name']] = $parameterData->getQueryParam($param['name']);
                        }
                        break;
                    case 'body':
                    default:
                        if ($parameterData->hasBodyParam($param['name'])) {
                            $validatorData[$param['name']] = $parameterData->getBodyParam($param['name']);
                        }
                        break;
                }

                foreach ($param as $pName => &$pValue) {
                    if (is_string($pValue) && $pValue == 'false') {
                        $pValue = false;
                    }
                    if ($pValue === 'true' || $pValue === 'false') {
                        $pValue = ($pValue == 'false') ? false : (bool) $pValue;
                    }
                    if ($pName == 'validators' && isset($pValue['validator']['options'])) {
                        foreach ($pValue['validator']['options'] as &$pValueOptionValue) {
                            if (is_string($pValueOptionValue)) {
                                if ($pValueOptionValue === 'true' || $pValueOptionValue === 'false') {
                                    $pValueOptionValue = ($pValueOptionValue == 'false') ? false : (bool) $pValueOptionValue;
                                } elseif (defined($pValueOptionValue)) {
                                    $pValueOptionValue = constant($pValueOptionValue);
                                } elseif (is_numeric($pValueOptionValue)) {
                                    $pValueOptionValue = intval($pValueOptionValue);
                                }
                            }
                        }
                    }
                }
                unset($param['source']);
                $inputFilter->add($param);
            }

            if ($inputFilter->count() === 0) {
                continue;
            }

            $inputFilter->setData($validatorData);

            if (!$inputFilter->isValid()) {
                $errorMessages = $inputFilter->getMessages();
            } else {
                // repopulate sources
                $validatedFilteredData = $inputFilter->getValues();
                foreach ($validatedFilteredData as $name => $value) {
                    switch ($validatorDataSources[$name]) {
                        case 'route':
                            $parameterData->setRouteParam($name, $validatedFilteredData[$name]);
                            break;
                        case 'query':
                            $parameterData->setQueryParam($name, $validatedFilteredData[$name]);
                            break;
                        case 'body':
                        default:
                            $parameterData->setBodyParam($name, $validatedFilteredData[$name]);
                            break;
                    }
                }
                unset($validatedFilteredData);
            }

        } // end foreach over sources:

        if ($errorMessagesPerSource !== $emptyErrorMessagesPerSource) {
            $e->setError('invalid-input');
            foreach ($errorMessagesPerSource as $sourceName => $errorsForSource) {
                unset($errorMessagesPerSource[$sourceName]);
                if ($errorsForSource !== array()) {
                    $errorMessagesPerSource[$sourceName . '_parameters'] = $errorsForSource;
                }
            }
            $e->setParam('input-error-messages', $errorMessagesPerSource);
        }


    } // end method

}
