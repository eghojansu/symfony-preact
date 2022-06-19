import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { withContext } from '../context'
import { isCheck } from '../lib/form'
import notify from '../lib/notify'
import Form from './form'

export default withContext(({
  ctx: {
    request,
  },
  onSubmit,
  afterSubmit,
  afterNotify,
  action,
  method = 'POST',
  ...formProps
}) => {
  const [state, stateSet] = useState({
    processing: false,
    values: {},
    checks: {},
    errors: {},
  })
  const setValues = values => stateSet(state => ({
    ...state,
    values: {
      ...state.values,
      ...(values || {}),
    },
  }))
  const setChecks = checks => stateSet(state => ({
    ...state,
    checks: {
      ...state.checks,
      ...(checks || {}),
    },
  }))
  const setErrors = errors => stateSet(state => ({
    ...state,
    errors: {
      ...state.errors,
      ...(errors || {}),
    },
  }))
  const handleInit = ({ name, type }) => {
    if (!name) {
      return {}
    }

    if (isCheck(type)) {
      return {
        onClick: e => {
          setChecks({ [name]: e.target.checked })
          setValues({ [name]: e.target.checked ? e.target.value : '' })
          setErrors({ [name]: e.target.validationMessage })
        }
      }
    }

    return {
      onInput: e => {
        setValues({ [name]: e.target.value })
        setErrors({ [name]: e.target.validationMessage })
      },
    }
  }
  const handleSubmit = async event => {
    event.preventDefault()

    const update = {
      values: {},
      checks: {},
      errors: {},
    }

    event.target.querySelectorAll('[name]').forEach($input => {
      if ($input.name in state.values) {
        return
      }

      if (isCheck($input.type)) {
        update.checks[$input.name] = $input.checked
        update.values[$input.name] = $input.checked ? $input.value : ''
      } else {
        update.values[$input.name] = $input.value
      }

      update.errors[$input.name] = $input.validationMessage
    })

    setValues(update.values)
    setChecks(update.checks)
    setErrors(update.errors)

    if (!event.target.checkValidity()) {
      return
    }

    stateSet(state => ({ ...state, processing: true }))

    if (onSubmit) {
      await onSubmit({
        values: { ...state.values, ...update.values },
        checks: { ...state.checks, ...update.checks },
        errors: { ...state.errors, ...update.checks },
        event,
        setValues,
        setChecks,
        setErrors,
      })
    } else if (action) {
      const values = {}
      const { success, message, data, errors } = await request(action, {
        method,
        data: { ...update.values, ...state.values },
      })

      event.target.querySelectorAll('[type=password]').forEach($password => {
        if ($password.name) {
          values[$password.name] = ''
        }
      })
      event.target.querySelectorAll('[class^="bi-eye"]').forEach($icon => {
        const $password = $icon.closest('.input-group').querySelector('.form-control')

        if ($password.name && !($password.name in values)) {
          values[$password.name] = ''
        }
      })

      setValues(values)

      if (errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(errors).map(([field, errors]) => [field, errors.join(', ')])
          )
        )
      }

      if (success) {
        const args = {
          values: { ...state.values, ...update.values },
          checks: { ...state.checks, ...update.checks },
          errors: { ...state.errors, ...update.checks },
          event,
          success,
          message,
          data,
          setValues,
          setChecks,
          setErrors,
        }

        if (afterSubmit) {
          await afterSubmit(args)
        } else {
          notify(message || 'Data has been submitted', true, {
            title: 'Successful'
          })

          if (afterNotify) {
            await afterNotify(args)
          } else if (data?.redirect) {
            setTimeout(() => {
              if (0 > data.redirect.indexOf('://')) {
                route(data.redirect)
              } else {
                window.location.assign(data.redirect)
              }
            }, 1200)
          } else if (data?.refresh) {
            setTimeout(() => window.location.reload(), 1200)
          }
        }
      }
    } else {
      notify('Unhandled form')
    }

    stateSet(state => ({ ...state, processing: false }))
  }

  return (
    <Form
      onSubmit={handleSubmit}
      modifyInput={handleInit}
      novalidate={true}
      {...state}
      {...formProps} />
  )
}, null)