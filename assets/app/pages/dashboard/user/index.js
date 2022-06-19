import { withContext } from '@app/context'
import Crud from '@app/components/crud'

export default withContext(({
}) => {
  const endpoint = '/api/user'
  const table = {
    columns: [
      {
        name: 'id',
        text: 'User ID',
        key: true,
      },
      {
        name: 'name',
      },
    ],
  }
  const renderContent = ({ ...tab }) => {
    return <div>Content</div>
  }
  const handleRequestForm = item => {
    return {
      controls: [
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
          name: 'newPassword',
          type: 'password',
          required: true,
          view: true,
          break: true,
        },
      ],
    }
  }

  return (
    <Crud
      title="Manage User"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
})