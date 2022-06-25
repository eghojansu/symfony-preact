import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '../context'
import notify, { confirm } from '../lib/notify'
import useTree from '../lib/tree'
import { ErrorPage } from './fallback'
import Pagination, { PaginationInfo, PaginationSizer } from './pagination'
import Panel from './panel'
import Table from './table'
import FormAuto from './form-auto'

export default withContext(Crud)

function Crud ({
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
}) {
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
  const tree = useTree(tree => {
    tree.add('Main')
  }, idKey, tab => ({
    ...tab,
    refresh: loadPagination,
  }))
  const toolbar = {
    label: 'Crud actions toolbar',
    ...(initialToolbar || {}),
    groups: [
      ...(creation ? [
        {
          text: 'New',
          icon: 'plus-circle',
          onClick: () => {
            tree.add('Create', true)
          }
        },
      ] : []),
      ...(initialToolbar?.groups || []),
    ]
  }
  const itemUrl = (item, keys) => `${endpoint}/${keys.map(key => item[key]).join('/')}`
  const handleAction = async ({ item: { id: action }, keys, row: item }) => {
    const url = itemUrl(item, keys)

    if ('remove' === action) {
      const { isConfirmed, value: { success, message } = {} } = await confirm(
        () => request(url, {
          method: 'DELETE',
          signal: controller.current.signal,
        })
      )

      if (isConfirmed && success) {
        notify(message, true)
        loadPagination()
      }

      return
    }

    if ('edit' === action) {
      const text = `Edit ${item[keys[0]]}`

      tree.add(text, true, 'edit', {
        data: { url, item, keys },
      })

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

      const { data: pagination } = await request(endpoint, {
        params,
        signal: controller.current.signal,
      })

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
  }, [endpoint, params])
  useEffect(() => {
    return () => {
      controller.current.abort()
    }
  }, [])

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
}
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
            <PaginationSizer currentSize={currentSize || size} size={pageSize} onChange={handleSizeChange} />
          </div>
        </div>
      )}
    </>
  )
}

export const CrudForm = ({
  endpoint,
  tab: {
    close,
    refresh,
    setData,
    data: { item, url } = {},
  },
  controls = [],
  ...formProps
}) => {
  const method = item ? 'PUT' : 'POST'
  const action = url || endpoint
  const useControls = [
    ...controls,
    ...(item ? [] : [
      {
        name: 'close',
        label: 'Close after saved',
        type: 'checkbox',
        value: '1',
        checked: true,
        break: true,
        extra: { ignore: true }
      }
    ]),
  ]
  const handleCancel = () => close && close()
  const handleSuccess = ({ values, reset }) => {
    refresh()

    if (values.close && close) {
      close()
    } else if (item) {
      setData({ item: values })
    } else {
      reset()
    }
  }

  return (
    <FormAuto {...{
      method,
      action,
      initials: item,
      controls: useControls,
      onCancel: handleCancel,
      afterSuccess: handleSuccess,
      ...formProps
    }} />
  )
}