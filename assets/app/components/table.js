import { clsx, caseTitle } from '../lib/common'
import { IconLoading } from './visual'
import { Toolbar } from './button'

export default Table

const TableRowHead = ({ columns }) => (
  <tr>
    {columns.map(column => (
      <TableHead key={column.name} {...column} />
    ))}
  </tr>
)

const TableHead = ({ name, text, header = {} }) => {
  const content = undefined === text ? caseTitle(name) : text

  return (
    <th {...header}>{content}</th>
  )
}

const TableRowData = ({ columns, item, renderRowAction }) => (
  <tr>
    {columns.map(column => (
      <TableData key={column.name} item={item} {...column} />
    ))}
    {renderRowAction && (<td>{renderRowAction({ item })}</td>)}
  </tr>
)

const TableData = ({ name, item, render, format }) => {
  const content = (() => {
    if (render) {
      return render(item)
    }

    const value = item[name]

    if (format) {
      return format(value, item)
    }

    if ('boolean' === typeof value) {
      return value ? 'Yes' : 'No'
    }

    return value
  })()

  return (
    <td>{content}</td>
  )
}

function Table ({
  class: clsa,
  loading,
  bordered = true,
  hover = true,
  striped = true,
  columns = [],
  items = [],
  keys: initialKeys = [],
  detailable,
  editable = true,
  removable = true,
  onAction,
}) {
  const hasRowActions = (detailable || editable || removable)
  const headers = columns.reduce((headers, column) => {
    const id = `row-${column.rowId || 1}`
    const header = headers.find(header => header.id === id) || { id, columns: [] }

    header.columns.push(column)

    if (1 === header.columns.length) {
      headers.push(header)
    }

    return headers
  }, []).map((header, idx) => {
    if (0 === idx && hasRowActions) {
      header.columns.push({
        name: '__action',
        text: null,
      })
    }

    return header
  })
  const keys = initialKeys.concat(columns.filter(column => column.key).map(column => column.name))
  const colSpan = headers.reduce((max, header) => Math.max(max, header.columns.length), 0)
  const empty = !items || items.length < 1
  const handleRowAction = row => args => onAction && onAction({
    ...args,
    row,
    keys,
  })
  const renderRowAction = hasRowActions ? ({ item }) => {
    const groups = [
      {
        label: "Row actions",
        size: 'sm',
        items: [
          ...(detailable ? [{
            id: 'view',
            icon: 'eye',
            variant: 'info',
          }] : []),
          ...(editable ? [{
            id: 'edit',
            icon: 'pencil',
            variant: 'success',
          }] : []),
          ...(removable ? [{
            id: 'remove',
            icon: 'trash',
            variant: 'danger',
          }] : []),
        ],
      }
    ]

    return <Toolbar label="Row actions" onClick={handleRowAction(item)} groups={groups} />
  } : null

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
          <TableRowHead key={header.id} {...header} />
        ))}
      </thead>
      <tbody>
        {!loading && items?.map(item => (
          <TableRowData key={item[keys[0]]} columns={columns} item={item} renderRowAction={renderRowAction} />
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