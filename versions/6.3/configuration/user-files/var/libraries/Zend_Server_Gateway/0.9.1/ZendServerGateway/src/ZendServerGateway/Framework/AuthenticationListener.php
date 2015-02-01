<?php

namespace ZendServerGateway\Framework;

use ZendServerGateway\ZendServerGateway;
use Zend\Mvc\MvcEvent;
use Zend\Stdlib\ArrayUtils;
use Zend\Authentication as Auth;
use Zend\Http\PhpEnvironment\Response as PhpEnvironmentResponse;

class AuthenticationListener
{

    protected $gateway;

    public function __construct(ZendServerGateway $gateway)
    {
        $this->gateway = $gateway;
    }

    public function __invoke(MvcEvent $e)
    {
        $routeMatch = $e->getRouteMatch();

        $config = $this->gateway->getConfiguration();

        // is authentication setup? if not return
        if (!isset($config['authenticate']['adapter']) || !is_array($config['authenticate']['adapter'])) {
            return;
        }

        $authConfig = $config['authenticate'];

        // fix the config for when there is 1 or more than 1
        if (!ArrayUtils::hasIntegerKeys($authConfig['adapter'])) {
            $authConfig['adapter'] = array($authConfig['adapter']);
        }

        $gwParams = $routeMatch->getParam('_gateway');
        if (isset($gwParams['authenticate']) && $gwParams['authenticate'] == 'false') {
            return;
        }

        $adapterConfigs = $authConfig['adapter'];

        $adapterAggregate = new Authentication\AdapterAggregate();

        foreach ($adapterConfigs as $adapterConfig) {
            if (!isset($adapterConfig['type'])) {
                continue;
            }
            $type = $adapterConfig['type'];
            unset($adapterConfig['type']);
            switch ($type) {
                case 'http':

                    // get resolver config, remove from http config
                    if (!isset($adapterConfig['resolver'])) {
                        throw new \Exception('The http adapter requires at least one resolver.');
                    }
                    $resolverConfigs = $adapterConfig['resolver'];
                    unset($adapterConfig['resolver']);

                    $adapterConfig['accept_schemes'] = '';

                    // cleanup config for resolver
                    if (!ArrayUtils::hasIntegerKeys($resolverConfigs)) {
                        $resolverConfigs = array($resolverConfigs);
                    }

                    // setup default Realm if not included
                    if (!isset($adapterConfig['realm'])) {
                        $adapterConfig['realm'] = 'Protected API';
                    }

                    foreach ($resolverConfigs as $resolverConfig) {
                        if (!isset($resolverConfig['for'])) {
                            $resolverConfig['for'] = 'basic';
                        }
                        switch ($resolverConfig['for']) {
                            case 'basic':
                                $adapterConfig['accept_schemes'] .= 'basic ';
                                if (isset($resolverConfig['type']) && $resolverConfig['type'] == 'callback') {
                                    $basicResolver = new Authentication\CallbackHtResolver($resolverConfig['callback'], $e->getRequest());
                                } elseif (isset($resolverConfig['path'])) {
                                    $basicResolver = new Auth\Adapter\Http\ApacheResolver($resolverConfig['path']);
                                } else {
                                    throw new \Exception('A valid resolver was not found in the configuration');
                                }
                                break;
                            case 'digest':
                                $adapterConfig['accept_schemes'] .= 'digest ';
                                if (!isset($adapterConfig['digest_domains'])) {
                                    $adapterConfig['digest_domains'] = $_SERVER['SERVER_NAME'];
                                }
                                if (!isset($adapterConfig['nonce_timeout'])) {
                                    $adapterConfig['nonce_timeout'] = 3600;
                                }
                                $digestResolver = new Auth\Adapter\Http\FileResolver($resolverConfig['path']);
                                break;
                        }
                    }
                    unset($resolverConfig);

                    // create adapter
                    $adapter = new Auth\Adapter\Http($adapterConfig);
                    $adapter->setRequest($e->getRequest());
                    $response = $e->getResponse();


                    // is there a basic resolver?
                    if (isset($basicResolver)) {
                        $adapter->setBasicResolver($basicResolver);
                    }

                    // is there a digest resolver?
                    if (isset($digestResolver)) {
                        $response = $digestResponse = new PhpEnvironmentResponse;
                        $adapter->setDigestResolver($digestResolver);
                    }

                    $adapter->setResponse($response);

                    $adapterAggregate->addAdapter($adapter);

                    unset($resolverConfigs, $basicResolver, $digestResolver, $adapter);

                    break;

                case 'token':

                    if (!isset($adapterConfig['resolver']['callback'])) {
                        throw new \Exception('Missing a resolver callback for this token adapter configuration');
                    }

                    // ensure token is before http
                    $adapterAggregate->addAdapter(
                        new Authentication\TokenCallbackAdapter($adapterConfig['resolver']['callback'], $e->getRequest()),
                        true
                    );

                    break;

                default:
                    throw new \Exception('Other adapters currently not supported');
            }

        }

        $auth = new Auth\AuthenticationService(new Auth\Storage\NonPersistent());

        /** @var $sm \Zend\ServiceManager\ServiceManager */
        $sm = $e->getApplication()->getServiceManager();
        $sm->setService('authentication', $auth);

        // authenticate
        $result = $auth->authenticate($adapterAggregate);

        if ($result->isValid()) {
            return;
        } elseif (isset($digestResponse) && $digestResponse->getHeaders()->has('WWW-Authenticate')) {
            return $digestResponse;
        } else {
            $e->setError('not-authorized');
            $e->stopPropagation(true);
        }

    }
}