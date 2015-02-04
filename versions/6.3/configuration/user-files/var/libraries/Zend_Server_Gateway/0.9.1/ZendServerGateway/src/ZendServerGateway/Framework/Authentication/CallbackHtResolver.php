<?php

namespace ZendServerGateway\Framework\Authentication;

use Zend\Authentication\Adapter\Http\ResolverInterface;
use Zend\Http\Request;
use Zend\Stdlib\CallbackHandler;
use Zend\Authentication\Result;


class CallbackHtResolver implements ResolverInterface
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
     * Resolve username/realm to password/hash/etc.
     *
     * @param  string $username Username
     * @param  string $realm    Authentication Realm
     * @param  string $password Password (optional)
     * @return string|array|false User's shared secret as string if found in realm, or User's identity as array
     *         if resolved, false otherwise.
     */
    public function resolve($username, $realm, $password = null)
    {
        $result = $this->callbackHandler->call(array($username, $password, $realm));
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
