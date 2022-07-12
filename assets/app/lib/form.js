import { useMemo, useState, useRef, useEffect } from 'preact/hooks'
import { caseKebab, caseTitle, clsx, clsa } from './common'
import { useAppContext } from '../context'
import notify from './notify'

export default useFormManual

export const isCheck = type => /^(checkbox|radio)$/i.test(type)
export const isChoice = type => /^choice$/i.test(type)

function useFormManual(fields, onSubmit) {
  const formRef = useRef({
    loaded: true,
  })
  const keys = Object.keys(fields)
  const norm = (name, field) => {
    const norms = field || {}
    const add = (name, value) => {
      if (!(name in norms)) {
        norms[name] = 'function' === typeof value ? value() : value
      }
    }
    const input = (name, value) => {
      if (!(name in norms.input)) {
        norms.input[name] = 'function' === typeof value ? value() : value
      }
    }

    add('label', () => caseTitle(name))
    add('check', isCheck(field?.input?.type))
    add('error', '')
    add('class', () => clsx(!norms.check && 'form-control', field?.clsa))

    add('input', {})
    input('type', 'text')
    input('name', name)
    input('value', '')
    input('class', norms.class)
    input('id', () => `input-${caseKebab(name)}`)
    !norms.check && input('placeholder', () => norms.label)

    clsa(field?.events || (norms.check ? 'click' : 'input')).forEach(event => {
      norms.input[`on${event}`] = event => handleChange(name, event)
    })

    return norms
  }
  const [state, stateSet] = useState(
    Object.entries(fields).reduce(
      (state, [name, field]) => ({ ...state, [name]: norm(name, field) }),
      {
        processing: false,
        clean: true,
        message: '',
      },
    )
  )
  const error = useMemo(() => keys.some(key => state[key].error) ? 'Please fix form errors below' : '', [state])
  const values = useMemo(() => keys.reduce((values, key) => ({
    ...values,
    [key]: !state[key].check || state[key].input.checked ? state[key].input.value : '',
  }), {}), [state])
  const handleChange = (name, e) => {
    const { target: { value, validationMessage } } = e

    setValue(name, value, false, validationMessage)
  }
  const handleSubmit = async event => {
    event.preventDefault()

    setProcessing(true)

    let submit = !error

    if (state.clean) {
      const errors = keys.map(key => [key, event.target.querySelector(`[name="${key}"]`)?.validationMessage])

      submit = !errors.some(([, error]) => error)

      if (!submit) {
        setErrors(Object.fromEntries(errors))
      }
    }

    if (submit && onSubmit) {
      await onSubmit(values, event)
    }

    formRef.current.loaded && setProcessing(false)
  }
  const setValue = (name, value, clean = false, error = '') => stateSet(state => {
    const update = {
      ...state[name],
      input: {
        ...state[name].input,
        ...(state[name].check ? { checked: !state[name].input.checked } : {}),
        value,
        class: clsx(state[name].class, error ? 'is-invalid' : '')
      },
      error,
    }

    return { ...state, [name]: update, clean }
  })
  const setErrors = errors => stateSet(state => {
    const updates = Object.entries(errors).filter(([key]) => keys.includes(key)).reduce((updates, [key, err]) => {
      const error = clsa(err).join(', ')

      return {
        ...updates,
        [key]: {
          ...state[key],
          input: {
            ...state[key].input,
            class: clsx(state[key].class, error && 'is-invalid')
          },
          error,
        },
      }
    }, {})

    return { ...state, ...updates }
  })
  const setMessage = message => stateSet(state => ({ ...state, message }))
  const setProcessing = processing => stateSet(state => {
    const updates = keys.reduce((updates, key) => ({
      ...updates,
      [key]: {
        ...state[key],
        input: {
          ...state[key].input,
          disabled: processing,
        },
      },
    }), {})

    return { ...state, ...updates, processing }
  })

  useEffect(() => () => formRef.current.loaded = false, [])

  return {
    state,
    error,
    values,
    handleSubmit,
    setValue,
    setErrors,
    setMessage,
  }
}

export const useFormAuto = setup => {
  const {
    onSubmit: doSubmit,
    afterSubmit,
    afterSuccess,
    afterComplete,
    initials,
    extra = {},
    extraControls = [],
    controls: originalControls = [],
    action,
    method = 'POST',
    ...formProps
  } = setup || {}
  const { request, cache, setCache } = useAppContext()
  const formRef = useRef({
    fetches: {},
    loaded: true,
    cancel: new AbortController(),
  })
  const [state, stateSet] = useState({
    processing: false,
    message: null,
    values: initials || {},
    errors: {},
    choices: {},
  })
  const controls = originalControls.concat(extraControls).map(control => {
    const { name, once, multiple, expanded, source, type } = control
    const hasValue = initials && name in initials
    const update = {}

    if (once && hasValue) {
      update.disabled = true
    }

    // if (source && !(name in formRef.current.fetches)) {
    //   formRef.current.fetches[name] = {
    //     source,
    //     fetched: false,
    //   }
    // }

    if (isCheck(type)) {
      update.onClick = e => {
        setValues({ [name]: e.target.checked ? e.target.value : '' })
        setErrors({ [name]: e.target.validationMessage })
      }
    } else if (isChoice(type)) {
      if (expanded) {
        update.onClick = e => {
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
      } else {
        update.onChange = e => {
          const value = multiple ? Array.from(e.target.selectedOptions, option => option.value).filter(v => '' !== v) : e.target.value

          setValues({ [name]: value })
          setErrors({ [name]: e.target.validationMessage })
        }
      }
    } else {
      update.onInput = e => {
        setValues({ [name]: e.target.value })
        setErrors({ [name]: e.target.validationMessage })
      }
    }

    return { ...control, ...update }
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
  const setProcessing = stateSetter('processing', false)
  const cancel = () => formRef.current.cancel.abort()
  const loadOptions = async () => {
    const fetchItems = async url => {
      if (cache && url in cache) {
        return cache[url]
      }

      const set = {}
      const { data } = await request(url, { signal: formRef.current.cancel.signal })

      if ('items' in data) {
        if (Array.isArray(data.items)) {
          set[url] = data.items
        } else if (data.items && 'object' === typeof data.items) {
          set[url] = Object.entries(data.items).map(([text, id]) => ({ id, text }))
        }
      }

      formRef.current.loaded && setCache(set)

      return set[url]
    }

    await Promise.all(
      Object.entries(formRef.current.fetches).filter(([, item]) => !item.fetched).map(
        ([name, { source }]) => new Promise(async resolve => {
          const items = await fetchItems(source)

          formRef.current.loaded && setChoices({ [name]: items })
          formRef.current.fetches[name] = { source, fetched: true }
          resolve()
        })
      )
    )
  }
  const onSubmit = async event => {
    event.preventDefault()

    const picks = []
    const passwords = {}
    const update = {
      values: {},
      errors: {},
    }

    controls.forEach(
      ({ name, type, once, expanded, multiple, extra: { ignore } = {} }) => {
        const check = isCheck(type)
        const choice = isChoice(type)

        if (
          !ignore
          && (!once || !initials || !(name in initials))
          && (!check || ((name in state.values) && state.values[name]))
        ) {
          picks.push(name)
        }

        if ('password' === type) {
          passwords[name] = ''
        }

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

    setProcessing(true)

    if (doSubmit) {
      await doSubmit({ ...args, reset })
    } else if (action) {
      const response = await request(action, {
        method,
        signal: formRef.current.cancel.signal,
        data: {
          ...extra,
          ...Object.fromEntries(
            picks.map(name => [
              name,
              name in args.values ? args.values[name] : null
            ])
          ),
        },
      })
      const { success, message, data, errors } = response

      setValues(passwords)

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

    formRef.current.loaded && setProcessing(false)
  }

  useEffect(() => {
    loadOptions()
  }, [formRef.current.fetches])
  useEffect(() => () => {
    formRef.current.loaded = false
    cancel()
  }, [])

  return {
    controls,
    onSubmit,
    cancel,
    novalidate: true,
    ...state,
    ...formProps,
  }
}