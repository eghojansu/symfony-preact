import { clsx } from '../lib/common'

export const Alert = ({ message, variant, title, onClose }) => (
  <div class={clsx('alert', `alert-${variant || 'danger'}`, onClose && 'alert-dismissible fade show')} role="alert">
    {title && <strong>{title}</strong>} {message}
    {onClose && <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={onClose}></button>}
  </div>
)