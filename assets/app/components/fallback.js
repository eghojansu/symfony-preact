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

export const ErrorPage = ({
  icon = 'search',
  title = 'Page Not Found',
  message = 'The page you are looking for is not exists',
}) => {
  return (
    <div class="d-flex p-5">
      <div class="fs-1 text-danger p-3">
        <i class={`bi-${icon}`}></i>
      </div>
      <div class="p-3 w-100">
        <h1 class="fs-4 pb-3 border-bottom">{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  )
}