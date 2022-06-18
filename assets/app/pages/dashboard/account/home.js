import { withContext } from '@app/context'
import Form from '@app/components/form-auto'

export default withContext(({
  ctx: {},
}) => {
  const controls = [
    {
      name: 'name',
      minlength: 5,
      required: true,
      break: true,
    },
    {
      name: 'email',
      type: 'email',
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
      action="/api/account/update"
      backUrl="/dashboard" />
  )
})