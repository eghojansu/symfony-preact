import { withGranted } from '@app/context'
import Crud from '@app/components/crud'

export default withGranted(MainPage)

function MainPage() {
  return (
    <Crud
      title="Manage Authorization"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
}

const endpoint = '/api/authorization'
const table = {
  access: true,
  columns: [
    {
      name: 'id',
      text: 'Role',
      key: true,
    },
    {
      name: 'description',
    },
  ],
}

const renderContent = tab => (
  (['create', 'edit'].includes(tab?.tag) && <FormPage tab={tab} />)
  || <div>Test Default</div>
)

const FormPage = ({ tab }) => {
  return (
    <>
      Editing Role
    </>
  )
}