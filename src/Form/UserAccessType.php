<?php

namespace App\Form;

use App\Entity\Csuser;
use App\Service\Choices;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class UserAccessType extends AbstractType
{
    public function __construct(
        private Choices $choices,
    ) {}

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('roles', ChoiceType::class, array(
                'multiple' => true,
                'choices' => $this->choices->roles(),
            ))
            ->add('newPassword')
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults(array(
            'data_class' => Csuser::class,
            'validation_groups' => array('access'),
        ));
    }
}
