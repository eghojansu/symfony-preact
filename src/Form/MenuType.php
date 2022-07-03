<?php

namespace App\Form;

use App\Entity\Csmenu;
use App\Service\Choices;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class MenuType extends AbstractType
{
    public function __construct(
        private Choices $choices,
    ) {}

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if ('POST' === $options['method']) {
            $builder->add('id');
        }

        $builder
            ->add('name')
            ->add('hint')
            ->add('active', CheckboxType::class)
            ->add('hidden', CheckboxType::class)
            ->add('icon')
            ->add('path')
            ->add('matcher')
            ->add('roles', ChoiceType::class, array(
                'multiple' => true,
                'choices' => $this->choices->roles(),
            ))
            ->add('parent', EntityType::class, array(
                'class' => Csmenu::class,
            ))
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Csmenu::class,
        ]);
    }
}
