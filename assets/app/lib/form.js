import { useMemo, useState } from 'preact/hooks'
import { caseKebab, caseTitle, clsx, clsa } from './common'

export const isCheck = type => ['checkbox', 'radio'].includes(type)

export default (fields, onSubmit) => {
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
  const handleChange = (name, e) => stateSet(state => {
    const { target: { value, validationMessage } } = e
    const update = {
      ...state[name],
      input: {
        ...state[name].input,
        ...(state[name].check ? { checked: !state[name].input.checked } : {}),
        value,
        class: clsx(state[name].class, validationMessage ? 'is-invalid' : '')
      },
      error: validationMessage,
    }

    return { ...state, [name]: update, clean: false }
  })
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

    setProcessing(false)
  }
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

  return {
    state,
    error,
    values,
    handleSubmit,
    setErrors,
    setMessage,
  }
}
