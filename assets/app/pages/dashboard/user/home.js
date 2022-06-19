import Table from '@app/components/table'

export default () => {
  const source = {
    url: '/api/user',
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

  return (
    <Table {...source} />
  )
}