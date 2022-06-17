import { caseKebab, caseTitle, clsx } from '../lib/common'
import { isCheck } from '../lib/form'

export const FormControl = ({
  name,
  clsa,
  label,
  valid,
  invalid,
  message,
  type = 'text',
  ...props
}) => {
  const check = isCheck(type)
  const text = label || props.placeholder || caseTitle(name)
  const defaults = {
    id: props.id || `input-${caseKebab(name)}`,
    placeholder: text,
  }
  const feedbackState = clsx(valid && 'is-valid', invalid && 'is-invalid')
  const feedback = message ? (
    <div class={clsx(valid && 'valid-feedback', invalid && 'invalid-feedback')}>{message}</div>
  ) : null

  if ('group' === type) {
    return <span class={clsx('input-group-text', clsa)} {...props}>{text}</span>
  }

  if (check) {
    return (
      <div class="form-check">
        <input {...{
          ...defaults,
          ...props,
          class: clsx('form-check-input', feedbackState, clsa),
          type,
        }} />
        <label class="form-check-label" for={props.id}>{text}</label>
        {feedback}
      </div>
    )
  }

  return (
    <>
      <input {...{
        ...defaults,
        ...props,
        class: clsx('form-control', feedbackState, clsa),
        type,
      }} />
      {feedback}
    </>
  )
}

export const FormGroup = ({
  clsa,
  controls,
  ...props
}) => {
  return (
    <div class={clsx('input-group', clsa)}>
      {(controls || []).map()}
    </div>
  )
}