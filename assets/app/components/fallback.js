import { clsx } from '../lib/common'

export const WaitingPage = ({
  hint = 'Waiting...',
  message = 'Still waiting, please be patient...',
}) => <LoadingPage hint={hint} message={message} />

export const LoadingPage = ({ ...props }) => (
  <Loading class="min-vh-100 justify-content-center" sm={false} {...props} />
)

export const Loading = ({
  class: clsa,
  sm = true,
  hint = 'Loading...',
  message = 'Loading, please wait...',
}) => (
  <div class={clsx('d-flex align-items-center', clsa)}>
    <div class={clsx('spinner-grow text-secondary', sm && 'spinner-grow-sm')} role="status">
      <span class="visually-hidden">{hint}</span>
    </div>
    <div class="text-secondary ms-2">{message}</div>
  </div>
)

export const NotFoundPage = () => {
  return (
    <div class="p-3">Not Found</div>
  )
}