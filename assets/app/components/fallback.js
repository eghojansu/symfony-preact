export const WaitingPage = ({
  hint = 'Waiting...',
  message = 'Still waiting, please be patient...',
}) => <LoadingPage hint={hint} message={message} />

export const LoadingPage = ({
  hint = 'Loading...',
  message = 'Loading awesome, please wait...',
}) => {
  return (
    <div class="min-vh-100 d-flex justify-content-center align-items-center">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">{hint}</span>
      </div>
      <div class="text-secondary ms-3">{message}</div>
    </div>
  )
}

export const NotFoundPage = () => {
  return (
    <div class="p-3">Not Found</div>
  )
}