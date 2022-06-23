import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '../context'
import notify, { confirm } from '../lib/notify'
import useTree from '../lib/tree'
import { ErrorPage } from './fallback'
import Pagination, { PaginationInfo, PaginationSizer } from './pagination'
import Panel from './panel'
import Table from './table'

export default withContext(({
  ctx: {
    request,
  },
  endpoint,
  items: initialItems,
  toolbar: initialToolbar,
  source = {},
  creation = true,
  idKey = 'text',
  renderContent,
  ...panelProps
}) => {
  const loadingRef = useRef()
  const initials = useRef({})
  const controller = useRef(new AbortController())
  const [loading, loadingSet] = useState(false)
  const [params, paramsSet] = useState({})
  const [pagination, paginationSet] = useState({
    items: [],
    page: 0,
    size: 0,
    next: 0,
    prev: 0,
    total: 0,
    pages: 0,
  })
  const createTab = (text, close, tab = {}) => ({
    ...tab,
    ...(idKey === text ? {} : { [idKey]: text }),
    text,
    attrs: { title: text },
    refresh: loadPagination,
    setData: (data, replace) => tree.setData(text, data, replace),
    ...(close ? { closable: true, close: () => tree.removeItem(text) } : {}),
  })
  const tree = useTree([
    createTab('Main'),
    ...(initialItems || []),
  ], null, idKey)
  const toolbar = {
    label: 'Crud actions toolbar',
    ...(initialToolbar || {}),
    groups: [
      ...(creation ? [
        {
          text: 'New',
          icon: 'plus-circle',
          onClick: () => {
            tree.addItem(createTab('Create', true))
          }
        },
      ] : []),
      ...(initialToolbar?.groups || []),
    ]
  }
  const itemUrl = (item, keys) => `${endpoint}/${keys.map(key => item[key]).join('/')}`
  const handleAction = async ({ item, keys, action }) => {
    const url = itemUrl(item, keys)

    if ('remove' === action) {
      const { isConfirmed, value: { success, message } } = await confirm(() => request(url, { method: 'DELETE' }))

      if (isConfirmed && success) {
        notify(message, true)
        loadPagination()
      }

      return
    }

    if ('edit' === action) {
      const text = `Edit ${item[keys[0]]}`

      tree.addItem(createTab(text, true, {
        id: 'edit',
        data: { url, item, keys },
      }))

      return
    }

    console.log('unhandled action', action)
  }
  const loadPagination = () => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = setTimeout(async () => {
      loadingSet(true)

      const { data: pagination } = await request(endpoint, { params, signal: controller.current.signal })

      paginationSet(pagination)
      loadingSet(false)

      if (!initials.current.pageSize) {
        initials.current.pageSize = pagination?.size
      }
      loadingRef.current = null
    }, 750)
  }

  useEffect(() => {
    endpoint && loadPagination()

    return () => {
      controller.current.abort()
    }
  }, [endpoint, params])

  return (
    <Panel
      items={tree.items}
      activeId={tree.activeId}
      toolbar={toolbar}
      tabIdKey={idKey}
      onTabSelect={tree.handleTabSelect}
      onTabClose={tree.handleTabClose}
      {...panelProps}>
      {'Main' === tree.activeId ? (
        <MainContent {...{
          loading,
          pagination,
          params,
          initials,
          onAction: handleAction,
          setParams: paramsSet,
          ...source,
        }} />
      ) : (renderContent(tree.activeItem) || <ErrorPage />)}
    </Panel>
  )
}, null)

const MainContent = ({
  setParams,
  initials: { current: { pageSize = 15 }},
  params: { size: currentSize } = {},
  pagination,
  loading,
  ...props
}) => {
  const { items, total, pages, page = 1, size = 15 } = pagination || {}
  const handleSizeChange = e =>setParams(params => ({ ...params, size: e.target.value }))
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
            {total > 0 && (<PaginationSizer currentSize={currentSize || size} size={pageSize} onChange={handleSizeChange} />)}
          </div>
        </div>
      )}
    </>
  )
}