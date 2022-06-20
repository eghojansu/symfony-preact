import { caseKebab, caseTitle, clsx, random } from '../lib/common'
import { isCheck } from '../lib/form'
import { Alert } from './dialog'
import { Action } from './button'

export const FormControl = ({
  name = 'control',
  label,
  valid,
  invalid,
  message,
  class: clsa,
  groupClass,
  view,
  generate,
  disabled,
  id: originalId,
  addons = [],
  type = 'text',
  ...props
}) => {
  const check = isCheck(type)
  const text = label || props.placeholder || caseTitle(name)
  const id = originalId || `input-${caseKebab(name)}`
  const feedbackState = clsx(valid && 'is-valid', invalid && 'is-invalid')
  const feedbackElement = message ? (
    <div class={clsx(valid && 'valid-feedback', invalid && 'invalid-feedback')}>{message}</div>
  ) : null

  if ('password' === type) {
    if (generate) {
      addons.push({
        type: 'button',
        icon: 'key',
        tabindex: -1,
        variant: 'warning',
        onClick: e => {
          const $input = e.target.closest('.input-group').querySelector('.form-control')

          $input.value = random(8)
          $input.dispatchEvent(new Event('input', { bubbles: true }))
        },
      })
    }

    if (view) {
      addons.push({
        type: 'button',
        icon: 'eye',
        tabindex: -1,
        variant: 'info',
        onClick: e => {
          const $input = e.target.closest('.input-group').querySelector('.form-control')
          const $icon = e.target.closest('[type=button]').querySelector('i[class^="bi-"]')
          const plain = $icon.classList.contains('bi-eye-slash')

          if (plain) {
            $input.type = 'password'
            $icon.classList.add('bi-eye')
            $icon.classList.remove('bi-eye-slash')
          } else {
            $input.type = 'text'
            $icon.classList.add('bi-eye-slash')
            $icon.classList.remove('bi-eye')
          }
        },
      })
    }
  }

  const addonsElement = (
    <>
      {addons.map((addon, idx) => (
        <FormControl key={addon.id || idx} {...{
          disabled,
          ...addon,
        }} />
      ))}
    </>
  )

  if ('addon' === type) {
    return <span class={clsx('input-group-text', clsa)} {...props}>{text}</span>
  }

  if ('button' === type) {
    return <Action {...{
      ...props,
      type,
      disabled,
      class: clsa,
    }} />
  }

  let control = null

  if (check) {
    control = (
      <div class="form-check">
        <input {...{
          ...props,
          class: clsx('form-check-input', feedbackState, clsa),
          disabled,
          type,
          name,
          id,
        }} />
        <label class="form-check-label" for={id}>{text}</label>
        {feedbackElement}
      </div>
    )
  } else {
    control = (
      <>
        <input {...{
          placeholder: text,
          ...props,
          class: clsx('form-control', feedbackState, clsa),
          disabled,
          type,
          name,
          id,
        }} />
        {addonsElement}
        {feedbackElement}
      </>
    )
  }

  if (!addons || addons.length < 1) {
    return control
  }

  return (
    <div class={clsx('input-group', message && 'has-validation', groupClass)}>
      {control}
    </div>
  )
}

export const FormGroup = ({
  name = 'control',
  type = 'text',
  grid = 4,
  label,
  placeholder,
  rootClass,
  break: enter,
  ...controlProps
}) => {
  const check = isCheck(type)
  const id = controlProps.id || `input-${caseKebab(name)}`
  const text = label || placeholder || caseTitle(name)
  const labelElement = check ? null : <label for={id} class="form-label">{text}</label>

  return (
    <>
      <div class={clsx(grid && `col-${grid}`, rootClass)}>
        {labelElement}
        <FormControl {...{
          name,
          type,
          label,
          ...(undefined === placeholder ? { placeholder: text } : { placeholder }),
          ...controlProps,
        }} />
      </div>
      {grid && enter && <div class="w-100 mb-3"></div>}
    </>
  )
}

export default ({
  processing,
  controls = [],
  method = 'POST',
  actionClass = 'col-12 pt-3',
  actionSubmit = {
    variant: 'primary',
    class: 'me-2',
    type: 'submit',
    text: 'Save',
    icon: 'check2-circle',
  },
  actionCancel = {
    type: 'a',
    text: 'Cancel',
    icon: 'x-circle',
  },
  backUrl = '/',
  message,
  messageVariant,
  values,
  checks,
  errors,
  modifyInput = () => ({}),
  ...props
}) => {
  return (
    <form method={method} {...props}>
      {message && <Alert message={message} variant={messageVariant} />}
      {controls.map(({ id, name, value, type, checked, disabled, ...input }, idx) => (
        <FormGroup
          key={id || name || idx}
          {...{
            id,
            name,
            type,
            value: !isCheck(type) && values && name && name in values ? values[name] : (undefined === value ? '' : value),
            disabled: disabled || processing,
            ...(errors && name && name in errors ? { invalid: !!errors[name], message: errors[name] } : {}),
            ...(checks && name && name in checks ? { checked: checks[name] } : { checked }),
            ...modifyInput({ id, name, value, type, checked, disabled, ...input }),
            ...input,
          }} />
      ))}
      {(actionSubmit || actionCancel) && (
        <div class={actionClass}>
          {actionSubmit && <Action {...{
            processing,
            ...actionSubmit,
          }} />}
          {actionCancel && <Action {...{
            url: backUrl,
            processing,
            ...actionCancel,
          }} />}
        </div>
      )}
    </form>
  )
}