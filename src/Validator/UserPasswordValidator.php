<?php

namespace App\Validator;

use App\Validator\UserPassword;
use Symfony\Component\Validator\Constraint;
use App\Service\RequestContext;
use Symfony\Component\PasswordHasher\Hasher\PasswordHasherFactoryInterface;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\ConstraintDefinitionException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

class UserPasswordValidator extends ConstraintValidator
{
    public function __construct(
        private PasswordHasherFactoryInterface $hasherFactory,
        private RequestContext $requestContext,
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

        $user = $this->requestContext->currentUser();

        if (!$user instanceof PasswordAuthenticatedUserInterface) {
            throw new ConstraintDefinitionException(sprintf('The "%s" class must implement the "%s" interface.', PasswordAuthenticatedUserInterface::class, get_debug_type($user)));
        }

        $hasher = $this->hasherFactory->getPasswordHasher($user);

        if (null === $user->getPassword() || !$hasher->verify($user->getPassword(), $password)) {
            $this->context->addViolation($constraint->message);
        }
    }
}
