<?php

namespace App\Validator;

use App\Validator\UserPassword;
use Symfony\Component\Validator\Constraint;
use App\DependencyInjection\Awareness\UserAware;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Contracts\Service\ServiceSubscriberTrait;
use Symfony\Contracts\Service\ServiceSubscriberInterface;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\ConstraintDefinitionException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

class UserPasswordValidator extends ConstraintValidator implements ServiceSubscriberInterface
{
    use ServiceSubscriberTrait, UserAware;

    public function __construct(
        private PasswordHasherFactoryInterface $hasherFactory,
    ) {}

    public function validate($password, Constraint $constraint)
    {
        if (!$constraint instanceof UserPassword) {
            throw new UnexpectedTypeException($constraint, UserPassword::class);
        }

        if (null === $password || '' === $password) {
            $this->context->addViolation($constraint->message);

            return;
        }

        if (!is_string($password)) {
            throw new UnexpectedTypeException($password, 'string');
        }

        $user = $this->user();

        if (!$user instanceof PasswordAuthenticatedUserInterface) {
            throw new ConstraintDefinitionException(sprintf('The "%s" class must implement the "%s" interface.', PasswordAuthenticatedUserInterface::class, get_debug_type($user)));
        }

        $hasher = $this->hasherFactory->getPasswordHasher($user);

        if (null === $user->getPassword() || !$hasher->verify($user->getPassword(), $password)) {
            $this->context->addViolation($constraint->message);
        }
    }
}
