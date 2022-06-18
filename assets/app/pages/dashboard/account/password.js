import Form from '@app/components/form-auto'

export default () => {
  const controls = [
    {
      name: 'newPassword',
      type: 'password',
      required: true,
      view: true,
      generate: true,
      break: true,
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