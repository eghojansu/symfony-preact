import { withUser } from '@app/context'
import Form from '@app/components/form-auto'

export default withUser(MainPage, true)

function MainPage ({
  ctx: {
    user,
    fetchUser,
  },
}) {
  const controls = [
    {
      name: 'name',
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
  const afterSuccess = async () => await fetchUser()

  return (
    <Form
      controls={controls}
      afterSuccess={afterSuccess}
      action="/api/account/update"
      backUrl="/dashboard" />
  )
}