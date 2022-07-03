<?php

namespace App\Form;

use Symfony\Component\Form\Extension\Core\Type\CheckboxType as BaseType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CheckboxType extends BaseType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults(array(
            'false_values' => array(null, '', 0, '0', 'off'),
        ));
    }
}