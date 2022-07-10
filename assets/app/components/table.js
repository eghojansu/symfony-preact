import { clsx, caseTitle } from '../lib/common'
import { IconLoading } from './visual'
import { Toolbar } from './button'
import Pagination, { PaginationInfo, PaginationSizer } from './pagination'
import { useMemo } from 'preact/hooks'

export default Table

export const PaginatedTable = ({
  setParams,
  pageSize = 15,
  params: { size: currentSize } = {},
  pagination,
  loading,
  ...props
}) => {
  const { items, total, pages, page = 1, size = 15 } = pagination || {}
  const handleSizeChange = e => setParams(params => ({ ...params, size: e.target.value }))
  const handlePageChange = ({ page }) => setParams(params => ({ ...params, page }))

  return (
    <>
      <Table items={items} loading={loading} {...props} />
      {!loading && (
        <div class="row">
          <div class="col">
            {total > 0 && (<PaginationInfo page={page} size={size} count={items?.length} total={total} />)}
          </div>
          <div class="col">
            {pages > 1 && (<Pagination page={page} pages={pages} direction="center" onChange={handlePageChange} />)}
          </div>
          <div class="col text-end">
            <PaginationSizer currentSize={currentSize || size} size={pageSize} onChange={handleSizeChange} />
          </div>
        </div>
      )}
    </>
  )
}

export const TableView = ({
  bordered = true,
  hover = true,
  striped = false,
  class: clsa,
  columns,
  item,
  children,
  toolbar,
}) => {
  return (
    <table class={clsx(
      'table table-view',
      bordered && 'table-bordered',
      striped && 'table-striped',
      hover && 'table-hover',
      clsa,
    )}>
      <tbody>
        {toolbar && (
          <>
            <tr><td colspan="2"><Toolbar {...toolbar} /></td></tr>
            <tr><td colspan="2"></td></tr>
          </>
        )}
        {columns.length < 1 && (
          <tr><td><em>No data available</em></td></tr>
        )}
        {columns.map(column => (
          <TableRowView key={column.name} column={column} item={item} />
        ))}
        {children}
      </tbody>
    </table>
  )
}

const TableRowView = ({
  column,
  item,
}) => {
  if (column.separator) {
    return (
      <tr><td colspan="2"></td></tr>
    )
  }

  return (
    <tr>
      <TableHead {...column} />
      <TableData item={item} {...column} />
    </tr>
  )
}

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
  rowAction = 'RUD',
  deletedColumn = 'deletedAt',
  onRowAction,
  action,
}) {
  const act = useMemo(() => ({
    viewable: rowAction && rowAction.includes('R'),
    editable: rowAction && rowAction.includes('U'),
    removable: rowAction && rowAction.includes('D'),
    restorable: rowAction && rowAction.includes('O'),
    destroyable: rowAction && rowAction.includes('E'),
  }), [rowAction])
  const hasRowActions = useMemo(() => (
    act.viewable || act.editable || act.removable || act.restorable
  ), [act])
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
  const refetchRow = row => () => items.find(item => keys.every(
    key => (key in item) && (key in row) && item[key] === row[key]
  )) || row
  const handleRowAction = row => args => onRowAction && onRowAction({
    ...args,
    row,
    keys,
    columns,
    action,
    refetch: refetchRow(row),
  })
  const renderRowAction = hasRowActions ? ({ item }) => {
    const isDeleted = deletedColumn && item[deletedColumn] ? true : false
    const groups = [
      {
        label: "Row actions",
        size: 'sm',
        items: [
          ...(act.viewable && !isDeleted ? [{
            id: 'view',
            icon: 'eye',
            variant: 'info',
          }] : []),
          ...(act.editable && !isDeleted ? [{
            id: 'edit',
            icon: 'pencil',
            variant: 'success',
          }] : []),
          ...(act.restorable && isDeleted ? [{
            id: 'restore',
            icon: 'arrow-counterclockwise',
            variant: 'warning',
          }] : []),
          ...(act.removable && (!isDeleted || act.destroyable) ? [{
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