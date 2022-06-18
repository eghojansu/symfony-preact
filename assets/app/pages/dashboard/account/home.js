import { withUser } from '@app/context'
import Form from '@app/components/form-auto'

export default withUser(({
  ctx: {
    user,
    fetchUser,
  },
}) => {
  const controls = [
    {
      name: 'name',
      minlength: 5,
      required: true,
      break: true,
      value: user?.name,
    },
    {
      name: 'email',
      type: 'email',
      break: true,
      value: user?.email,
    },
    {
      name: 'currentPassword',
      type: 'password',
      required: true,
      view: true,
      break: true,
    },
  ]
  const afterNotify = async () => await fetchUser()

  return (
    <Form
      controls={controls}
      afterNotify={afterNotify}
      action="/api/account/update"
      backUrl="/dashboard" />
  )
})