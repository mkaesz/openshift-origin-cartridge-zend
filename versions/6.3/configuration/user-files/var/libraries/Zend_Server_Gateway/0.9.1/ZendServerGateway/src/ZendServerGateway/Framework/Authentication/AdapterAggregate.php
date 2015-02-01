<?php

namespace ZendServerGateway\Framework\Authentication;

use Zend\Authentication\Adapter\AdapterInterface;
use Zend\Authentication\Result;

class AdapterAggregate implements AdapterInterface
{

    /** @var AdapterInterface[] */
    protected $adapters = array();

    public function addAdapter(AdapterInterface $adapter, $prepend = false)
    {
        if ($prepend) {
            array_unshift($this->adapters, $adapter);
        } else {
            $this->adapters[] = $adapter;
        }
    }

    /**
     * Performs an authentication attempt
     *
     * @return \Zend\Authentication\Result
     * @throws \Zend\Authentication\Adapter\Exception\ExceptionInterface If authentication cannot be performed
     */
    public function authenticate()
    {
        $messages = array();

        foreach ($this->adapters as $adapter) {
            $result = $adapter->authenticate();
            if ($result->isValid()) {
                return $result;
            }

            $messages = array_merge($messages, $result->getMessages());
        }

        return new Result(Result::FAILURE, null, $messages);
    }
}