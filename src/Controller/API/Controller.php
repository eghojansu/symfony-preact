<?php

namespace App\Controller\API;

use App\Extension\API\Rest;
use App\Controller\Controller as BaseController;

/**
 * @property Rest $api
 */
abstract class Controller extends BaseController
{
    protected static function subscribing(): array
    {
        return array(
            'api' => Rest::class,
        );
    }
}