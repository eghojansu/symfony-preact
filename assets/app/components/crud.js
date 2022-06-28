import { withContext } from '../context'
import notify, { confirm } from '../lib/notify'
import useTree from '../lib/tree'
import useTable from '../lib/table'
import { useFormAuto } from '../lib/form'
import { ErrorPage } from './fallback'
import { PaginatedTable } from './table'
import Panel from './panel'
import Form from './form'
import { useEffect, useRef } from 'preact/hooks'

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
  const crudRef = useRef({
    cancel: new AbortController(),
  })
  const cancel = () => crudRef.current.cancel.abort()
  const table = useTable({
    source: endpoint,
    onAction: async ({ item: { id: action }, keys, row: item, url }) => {
      if ('remove' === action) {
        const { isConfirmed, value: { success, message } = {} } = await confirm(
          () => request(url, {
            method: 'DELETE',
            signal: crudRef.current.cancel.signal,
          })
        )

        if (isConfirmed && success) {
          notify(message, true)
          table.load()
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
    },
    ...source,
  })
  const tree = useTree(tree => {
    tree.add('Main')
  }, idKey, tab => ({
    ...tab,
    refresh: table.load,
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

  useEffect(() => () => cancel(), [])

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
        <PaginatedTable {...table} />
      ) : (renderContent(tree.activeItem) || <ErrorPage />)}
    </Panel>
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
  ...formProps
}) => {
  const form = useFormAuto({
    method: item ? 'PUT' : 'POST',
    action: url || endpoint,
    initials: item,
    extraControls: (item ? [] : [
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
    onCancel: () => close && close(),
    afterSuccess: ({ values, reset }) => {
      refresh()

      if (values.close && close) {
        close()
      } else if (item) {
        setData({ item: values })
      } else {
        reset()
      }
    },
    ...formProps,
  })

  return (<Form {...form} />)
}