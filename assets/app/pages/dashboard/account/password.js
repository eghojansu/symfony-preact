import Form from '@app/components/form-auto'

export default MainPage

function MainPage() {
  const controls = [
    {
      name: 'newPassword',
      type: 'password',
      required: true,
      view: true,
      generate: true,
    },
    {
      name: 'currentPassword',
      type: 'password',
      required: true,
      view: true,
      break: true,
    },
  ]

  return (
    <Form
      controls={controls}
      action="/api/account/password"
      backUrl="/dashboard" />
  )
}