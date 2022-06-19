import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '../context'
import useTree from '../lib/tree'
import Panel from './panel'
import Form from './form-auto'
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
  renderContent,
  ...panelProps
}) => {
  const loadingRef = useRef()
  const [loading, loadingSet] = useState(false)
  const [pagination, paginationSet] = useState({})
  const tree = useTree([
    {
      text: 'Main',
    },
    ...(initialItems || []),
  ], 'Main')
  const toolbar = {
    label: 'Crud actions toolbar',
    ...(initialToolbar || {}),
    groups: [
      ...(creation ? [
        {
          text: 'New',
          icon: 'plus-circle',
          onClick: () => {
            tree.addItem({
              text: 'Create',
              closable: true,
            })
          }
        },
      ] : []),
      ...(initialToolbar?.groups || []),
    ]
  }
  const handleTabClose = ({ item }) => tree.removeItem(item.text)
  const handleTabSelect = ({ item }) => tree.setActive(item.text)
  const content = (
    renderContent && 'Main' !== tree.activeId ? renderContent({
      ...tree.activeItem,
    }) : <Table loading={loading} pagination={pagination} {...source} />
  )
  const loadPagination = () => {
    if (loadingRef.current) {
      return
    }

    loadingRef.current = setTimeout(async () => {
      loadingSet(true)

      const { data: pagination } = await request(endpoint)

      itemsSet(pagination)
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
      onTabSelect={handleTabSelect}
      onTabClose={handleTabClose}
      children={content}
      {...panelProps} />
  )
}, null)