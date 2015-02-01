<?php

namespace ZendServerGateway\Framework\Authentication;

use Zend\Authentication\Adapter\AdapterInterface;
use Zend\Http\Request;
use Zend\Stdlib\CallbackHandler;
use Zend\Authentication\Result;


class TokenCallbackAdapter implements AdapterInterface
{
    /** @var Request */
    protected $request;

    /** @var CallbackHandler */
    protected $callbackHandler = null;

    public function __construct($callable, Request $request, $doubleColonIsStaticCall = false)
    {
        if (is_string($callable) && strpos($callable, '::') && !$doubleColonIsStaticCall) {
            list($class, $method) = explode('::', $callable, 2);
            $callable = array(new $class, $method);
        }
        $this->callbackHandler = new CallbackHandler($callable);
        $this->request = $request;
    }


    /**
     * Performs an authentication attempt
     *
     * @return \Zend\Authentication\Result
     * @throws \Zend\Authentication\Adapter\Exception\ExceptionInterface If authentication cannot be performed
     */
    public function authenticate()
    {
        /** @var $authHeader \Zend\Http\Header\Authorization */
        $authHeader = $this->request->getHeader('Authorization');

        if (!$authHeader) {
            return new Result(Result::FAILURE, null, array('No token header found.'));
        }

        $authValue = $authHeader->getFieldValue();
        list($type, $token) = explode(' ', $authValue, 2);

        if (strtolower($type) !== 'token') {
            return new Result(Result::FAILURE, null, array('No valid token header found.'));
        }

        $result = $this->callbackHandler->call(array($token));
        if (!$result instanceof Result) {
            if ($result == false) {
                $result = new Result(Result::FAILURE, null, array('Not authorized.'));
            } else {
                $result = new Result(Result::SUCCESS, $result, array('Non-false value returned from authentication callback for token validation.'));
            }
        }

        return $result;
    }

}
