import { route } from 'preact-router'
import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '../context'
import { isCheck, isChoice } from '../lib/form'
import notify from '../lib/notify'
import Form from './form'

export default withContext(FormAuto)

function FormAuto({
  ctx: {
    request,
  },
  onSubmit,
  afterSubmit,
  afterSuccess,
  afterComplete,
  action,
  method = 'POST',
  ...formProps
}) {
  const fetches = useRef({})
  const fields = useRef({})
  const controller = useRef(new AbortController())
  const [state, stateSet] = useState({
    processing: false,
    message: null,
    values: {},
    errors: {},
    choices: {},
  })
  const stateSetter = (name, initials = {}) => updates => stateSet(state => ({
    ...state,
    [name]: initials && 'object' === typeof initials ? {
      ...state[name],
      ...(updates || initials),
    } : updates,
  }))
  const setValues = stateSetter('values')
  const setErrors = stateSetter('errors')
  const setChoices = stateSetter('choices')
  const setMessage = stateSetter('message', '')
  const loadSources = async () => {
    const fetchItems = async url => {
      const { data } = await request(url, { signal: controller.current.signal })

      if ('items' in data) {
        if (Array.isArray(data.items)) {
          return data.items
        }

        if ('object' === typeof data.items) {
          return Object.entries(data.items).map(([text, id]) => ({ id, text }))
        }
      }

      return []
    }

    await Promise.all(
      Object.entries(fetches.current).filter(([, item]) => !item.fetched).map(
        ([name, { source }]) => new Promise(async resolve => {
          const items = await fetchItems(source)

          setChoices({ [name]: items })
          fetches.current[name] = { source, fetched: true }
          resolve()
        })
      )
    )
  }
  const handleInit = (input) => {
    if (!input?.name) {
      return {}
    }

    const { name, type, expanded, multiple, source } = input

    fields.current[name] = input

    if (isCheck(type)) {
      return {
        onClick: e => {
          setValues({ [name]: e.target.checked ? e.target.value : '' })
          setErrors({ [name]: e.target.validationMessage })
        }
      }
    }

    if (source && !(name in fetches.current)) {
      fetches.current[name] = {
        source,
        fetched: false,
      }
    }

    if (isChoice(type)) {
      if (expanded) {
        return {
          onClick: e => {
            let value

            if (multiple) {
              value = Array.isArray(state.values[name]) ? [...state.values[name]] : [state.values[name]].filter(val => undefined !== val)

              if (e.target.checked) {
                value.push(e.target.value)
              } else if (value.indexOf(e.target.value) > -1) {
                value.splice(value.indexOf(e.target.value), 1)
              }
            } else {
              value = e.target.checked ? e.target.value : ''
            }

            setValues({ [name]: value })
            setErrors({ [name]: state.errors[name] || e.target.validationMessage })
          }
        }
      }

      return {
        onChange: e => {
          const value = multiple ? Array.from(e.target.selectedOptions, option => option.value).filter(v => '' !== v) : e.target.value

          setValues({ [name]: value })
          setErrors({ [name]: e.target.validationMessage })
        },
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

    const ignores = []
    const update = {
      values: {},
      errors: {},
    }

    Object.entries(fields.current).forEach(
      ([name, { type, expanded, multiple, extra: { ignore } = {} }]) => {
        if (ignore) {
          ignores.push(name)
        }

        const check = isCheck(type)
        const choice = isChoice(type)

        event.target.querySelectorAll(`[name="${name}"]`).forEach(el => {
          update.errors[name] = update.errors[name] || el.validationMessage

          if (name in state.values) {
            return
          }

          if (choice) {
            if (expanded) {
              if (multiple) {
                if (el.checked) {
                  if (Array.isArray(update.values[name])) {
                    update.values[name].push(el.value)
                  } else {
                    update.values[name] = [el.value]
                  }
                }
              } else if (el.checked) {
                update.values[name] = el.value
              }

              return
            }

            update.values[name] = multiple ? Array.from(el.selectedOptions, option => option.value).filter(v => '' !== v) : el.value

            return
          }

          if (check) {
            update.values[name] = el.checked ? el.value : ''

            return
          }

          update.values[name] = el.value
        })
      }
    )

    setValues(update.values)
    setErrors(update.errors)

    if (!event.target.checkValidity()) {
      return
    }

    const args = {
      values: { ...state.values, ...update.values },
      errors: { ...state.errors, ...update.errors },
      event,
      setValues,
      setErrors,
      setChoices,
    }
    const reset = () => {
      setValues(
        Object.fromEntries(Object.keys(args.values).map(key => [key, '']))
      )
    }

    stateSet(state => ({ ...state, processing: true }))

    if (onSubmit) {
      await onSubmit({ ...args, reset })
    } else if (action) {
      const values = {}
      const response = await request(action, {
        method,
        signal: controller.current.signal,
        data: (() => {
          const values = { ...update.values, ...state.values }

          ignores.forEach(ignore => delete values[ignore])

          return values
        })(),
      })
      const { success, message, data, errors } = response

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
        if (Array.isArray(errors)) {
          setMessage(errors.join(', '))
        } else {
          setErrors(
            Object.fromEntries(
              Object.entries(errors).map(([field, errors]) => [field, errors.join(', ')])
            )
          )
        }
      }

      if (success) {
        if (afterSubmit) {
          await afterSubmit({ ...response, ...args, reset })
        } else {
          notify(message || 'Data has been submitted', true, {
            title: 'Successful'
          })

          if (afterSuccess) {
            await afterSuccess({ ...response, ...args, reset })
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

      afterComplete && afterComplete({ ...response, ...args, reset })
    } else {
      notify('Unhandled form')
    }

    stateSet(state => ({ ...state, processing: false }))
  }

  useEffect(() => {
    loadSources()
  }, [fetches])
  useEffect(() => {
    return () => {
      controller.current.abort()
    }
  }, [])

  return (
    <Form
      onSubmit={handleSubmit}
      modifyInput={handleInit}
      novalidate={true}
      {...state}
      {...formProps} />
  )
}