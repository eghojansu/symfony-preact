import { caseKebab, caseTitle, clsx, random } from '../lib/common'
import { isCheck, isChoice } from '../lib/form'
import { Alert } from './dialog'
import { Action } from './button'

export default Form

export const FormControl = ({
  name = 'control',
  value,
  label,
  valid,
  invalid,
  message,
  class: clsa,
  groupClass,
  multiple,
  expanded,
  view,
  generate,
  disabled,
  id: originalId,
  items,
  extra,
  renderAutocomplete,
  addons = [],
  type = 'text',
  ...props
}) => {
  const check = isCheck(type)
  const choice = isChoice(type)
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
        onClick: ({ event }) => {
          const $input = event.target.closest('.input-group').querySelector('.form-control')

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
        onClick: ({ event }) => {
          const $input = event.target.closest('.input-group').querySelector('.form-control')
          const $icon = event.target.closest('[type=button]').querySelector('i[class^="bi-"]')
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
          value,
          type,
          name,
          id,
        }} />
        <label class="form-check-label" for={id}>{text}</label>
        {feedbackElement}
      </div>
    )
  } else if (choice && expanded) {
    if (multiple) {
      control = (
        <>
          {(items || []).map((item, ndx) => (
            <div key={item.id} class="form-check">
              <input {...{
                ...props,
                class: clsx('form-check-input', feedbackState, clsa),
                disabled,
                checked: Array.isArray(value) && value.includes(item.id),
                value: item.id,
                type: 'checkbox',
                name,
                id: `${id}-${item.id}`,
              }} />
              <label class="form-check-label" for={`${id}-${item.id}`}>{item.text}</label>
              {(ndx === items.length - 1) && feedbackElement}
            </div>
          ))}
        </>
      )
    } else {
      control = (
        <>
          {(items || []).map((item, ndx) => (
            <div key={item.id} class="form-check">
              <input {...{
                ...props,
                class: clsx('form-check-input', feedbackState, clsa),
                disabled,
                checked: value == item.id,
                value: item.id,
                type: 'radio',
                name,
                id: `${id}-${item.id}`,
              }} />
              <label class="form-check-label" for={`${id}-${item.id}`}>{item.text}</label>
              {(ndx === items.length - 1) && feedbackElement}
            </div>
          ))}
        </>
      )
    }
  } else if (choice) {
    control = (
      <>
        <select {...{
          ...props,
          class: clsx('form-select', feedbackState, clsa),
          multiple,
          disabled,
          value,
          name,
          id,
        }}>
          <option key="_placeholder" value="">{`-- Select ${text} --`}</option>
          {(items || []).map(item => (
            <option value={item.id} key={item.id}>{item.text}</option>
          ))}
        </select>
        {addonsElement}
        {feedbackElement}
      </>
    )
  } else {
    control = (
      <>
        <input {...{
          placeholder: text,
          ...props,
          class: clsx('form-control', feedbackState, clsa),
          disabled,
          value,
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

function Form({
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
  onCancel,
  backUrl = '/',
  message,
  messageVariant,
  values,
  errors,
  choices,
  modifyInput = () => ({}),
  ...props
}) {
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
            ...(isCheck(type) && values && name in values ? { checked: value == values[name] } : { checked }),
            ...(errors && name && name in errors ? { invalid: !!errors[name], message: errors[name] } : {}),
            ...(choices && name && name in choices ? { items: choices[name] } : {}),
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
            processing,
            url: onCancel ? null : backUrl,
            ...actionCancel,
            ...(onCancel ? { type: 'button', onClick: onCancel } : {}),
          }} />}
        </div>
      )}
    </form>
  )
}