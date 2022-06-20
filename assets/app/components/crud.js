import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '../context'
import notify, { confirm } from '../lib/notify'
import useTree from '../lib/tree'
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
  const [loading, loadingSet] = useState(false)
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
  ], 'Main', idKey)
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
  const handleTabClose = ({ item }) => tree.removeItem(item[idKey])
  const handleTabSelect = ({ item }) => tree.setActive(item[idKey])
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

      const { data: pagination } = await request(endpoint)

      paginationSet(pagination)
      loadingSet(false)
      loadingRef.current = null
    }, 750)
  }

  useEffect(() => {
    endpoint && loadPagination()
  }, [endpoint])

  return (
    <Panel
      items={tree.items}
      activeId={tree.activeId}
      toolbar={toolbar}
      tabIdKey={idKey}
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      {...panelProps}>
      {renderContent && 'Main' !== tree.activeId ? renderContent({
        ...tree.activeItem,
      }) : (
        <Table
          loading={loading}
          items={pagination?.items}
          onAction={handleAction}
          {...source} />
      )}
    </Panel>
  )
}, null)