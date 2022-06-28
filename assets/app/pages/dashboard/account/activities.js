import Table from '@app/components/table'
import useTable from '@app/lib/table'

export default MainPage

function MainPage() {
  const { pagination: { items }, ...table } = useTable({
    columns: [
      { name: 'name' },
      { name: 'recordDate' },
    ],
    editable: false,
    removable: false,
    source: '/api/account/activities',
    formatPage: ({ activities: items }) => pagination => ({
      ...pagination,
      items,
    }),
  })

  return (<Table items={items} {...table} />)
}