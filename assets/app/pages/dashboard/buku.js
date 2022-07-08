import { withGranted } from '@app/context'
import Crud from '@app/components/crud'

export default withGranted(MainPage)

function MainPage() {
  return (
    <Crud
      title="Daftar Buku"
      titleKey="nama"
      endpoint={endpoint}
      source={table}
      form={form} />
  )
}

const endpoint = '/api/buku'
const form = {
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
  access: 'bk',
  columns: [
    {
      name: 'nama',
    },
    {
      name: 'harga',
    },
  ],
}