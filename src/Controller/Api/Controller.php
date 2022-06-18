<?php

namespace App\Controller\Api;

use App\Service\Api;
use App\Controller\Controller as BaseController;

/**
 * @property Api $api
 */
abstract class Controller extends BaseController
{
    protected static function subscribing(): array
    {
        return array(
            'api' => Api::class,
        );
    }
}