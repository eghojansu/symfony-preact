import { Alert } from './dialog'
import useForm from '../lib/form'
import notify from '../lib/notify'

export default FormLogin

function FormLogin ({
  app,
  onSubmit,
}) {
  const {
    handleSubmit,
    setValue,
    error,
    state: {
      username,
      password,
      remember,
      processing,
      message,
    } } = useForm({
    username: {
      clsa: 'control-start',
      label: 'Username or email',
      input: {
        required: true,
      }
    },
    password: {
      clsa: 'control-end',
      input: {
        type: 'password',
        required: true,
      },
    },
    remember: {
      input: {
        type: 'checkbox',
        value: 'me',
        class: null,
      },
    },
  }, async values => {
    const { success } = await onSubmit(values)

    if (success) {
      notify('Welcome back', true)
    } else {
      setValue('password', '', true)
    }
  })

  return (
    <div class="min-vh-100 d-flex justify-content-center align-items-center">
      <form method="POST" class="form-signin" autocomplete="off" noValidate onSubmit={handleSubmit}>
        <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

        {(error || message) && <Alert message={error || message} />}

        <div class="form-floating">
          <input {...username.input} />
          <label for={username.input.id}>{username.label}</label>
          {username.error && <div class="invalid-feedback mb-2">{username.error}</div>}
        </div>
        <div class="form-floating">
          <input {...password.input} />
          <label for={password.input.id}>{password.label}</label>
          {password.error && <div class="invalid-feedback mb-2">{password.error}</div>}
        </div>
        <div class="checkbox mb-3">
          <label><input {...remember.input} /> Remember me</label>
        </div>

        <button disabled={processing} class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        <p class="mt-5 mb-3 text-muted">&copy; {app.year}</p>
      </form>
    </div>
  )
}