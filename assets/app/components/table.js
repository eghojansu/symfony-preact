import { clsx, caseTitle } from '../lib/common'
import { IconLoading } from './visual'

const TableRowHead = ({ columns }) => (
  <tr>
    {columns.map(column => (
      <TableHead key={column.name} {...column} />
    ))}
  </tr>
)

const TableHead = ({ name, text, header = {} }) => {
  const content = text || caseTitle(name)

  return (
    <th {...header}>{content}</th>
  )
}

const TableRowData = ({ columns, item }) => (
  <tr>
    {columns.map(column => (
      <TableData key={column.name} item={item} {...column} />
    ))}
  </tr>
)

const TableData = ({ name, item }) => {
  return (
    <td>{item[name]}</td>
  )
}

export default ({
  class: clsa,
  loading,
  bordered = true,
  hover = true,
  striped = true,
  columns = [],
  pagination = {
    items: [],
    page: 0,
    size: 0,
    next: 0,
    prev: 0,
    total: 0,
    pages: 0,
  },
}) => {
  const headers = columns.reduce((headers, column) => {
    const id = `row-${column.rowId || 1}`
    const header = headers.find(header => header.id === id) || { id, columns: [] }

    header.columns.push(column)

    if (1 === header.columns.length) {
      headers.push(header)
    }

    return headers
  }, [])
  const keys = columns.filter(column => column.key).map(column => column.name)
  const colSpan = headers.reduce((max, header) => Math.max(max, header.columns.length), 0)
  const empty = !items || items.length < 1

  return (
    <table class={clsx(
      'table',
      bordered && 'table-bordered',
      striped && 'table-striped',
      hover && 'table-hover',
      clsa,
    )}>
      <thead>
        {headers.map(header => (
          <TableRowHead key={header.id} columns={columns} />
        ))}
      </thead>
      <tbody>
        {!loading && items?.map(item => (
          <TableRowData key={item[keys[0]]} columns={columns} item={item} />
        ))}
        {(loading || empty) && (
          <tr>
            <td colSpan={colSpan}>
              {loading ? <IconLoading /> : <span class="fst-italic">No data available</span>}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}