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

    if (!event.target.checkValidity()) {
      const values = {}
      const checks = {}
      const errors = {}

      event.target.querySelectorAll('[name]').forEach($input => {
        if (isCheck($input.type)) {
          checks[$input.name] = $input.checked
          values[$input.name] = $input.checked ? $input.value : ''
        } else {
          values[$input.name] = $input.value
        }

        errors[$input.name] = $input.validationMessage
      })

      setValues(values)
      setChecks(checks)
      setErrors(errors)

      return
    }

    stateSet(state => ({ ...state, processing: true }))

    if (onSubmit) {
      await onSubmit({
        ...state,
        event,
        setValues,
        setChecks,
        setErrors,
      })
    } else if (action) {
      const values = {}
      const response = await request(action, {
        method,
        data: state.values,
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
      console.log(response)
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
})