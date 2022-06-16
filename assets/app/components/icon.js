import { clsx } from '../lib/common'

export const IconLabel = ({ text, icon }) => (
  <>
    {icon && <i class={clsx(`bi-${icon}`, text && 'me-2')}></i>}
    {text}
  </>
)
export const IconSpinner = ({ status = 'Loading...', mode = 'border', size = 'sm', variant = 'secondary' }) => (
  <div class={clsx(`spinner-${mode}`, size && `spinner-${mode}-sm`, variant && `text-${variant}`)} role="status">
    {status && <span class="visually-hidden">{status}</span>}
  </div>
)