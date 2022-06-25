import { withGranted } from '@app/context'
import Crud, { CrudForm } from '@app/components/crud'

export default withGranted(MainPage)

function MainPage() {
  return (
    <Crud
      title="Daftar Buku"
      renderContent={renderContent}
      endpoint={endpoint}
      source={table} />
  )
}

const endpoint = '/api/buku'
const formProps = {
  endpoint,
  controls: [
    {
      name: 'nama',
      minlength: 5,
      required: true,
    },
    {
      name: 'harga',
      required: true,
    },
  ],
}
const table = {
  keys: ['id'],
  columns: [
    {
      name: 'nama',
    },
    {
      name: 'harga',
    },
  ],
}

const renderContent = tab => (
  (['create', 'edit'].includes(tab?.id) && (
    <CrudForm key={tab.text} tab={tab} {...formProps} />
  ))
  || null
)