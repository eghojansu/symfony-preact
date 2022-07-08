import { useEffect, useRef, useMemo } from 'preact/hooks'
import { withContext } from '../context'
import notify, { confirm } from '../lib/notify'
import useTree from '../lib/tree'
import useTable from '../lib/table'
import { useFormAuto } from '../lib/form'
import { ErrorPage } from './fallback'
import { PaginatedTable, TableView } from './table'
import Panel from './panel'
import Form from './form'

export default withContext(Crud)

function Crud ({
  ctx: {
    request,
  },
  endpoint,
  items: initialItems,
  toolbar: initialToolbar,
  source = {},
  form = {},
  idKey,
  titleKey,
  detailColumns,
  renderContent = () => null,
  ...panelProps
}) {
  const crudRef = useRef({
    loaded: true,
    cancel: new AbortController(),
  })
  const cancel = () => crudRef.current.cancel.abort()
  const table = useTable({
    source: endpoint,
    onRowAction: async args => {
      const {
        item: { id: action },
        row: item,
        keys,
        url,
        columns,
      } = args
      const label = item[titleKey || keys[0]]

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

      if ('restore' === action) {
        const { isConfirmed, value: { success, message } = {} } = await confirm(
          () => request(`${url}/restore`, {
            method: 'PATCH',
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
        const text = `Edit ${label}`

        tree.add(text, true, action, {
          data: { url, item, keys },
          row: args,
        })

        return
      }

      if ('view' === action) {
        const text = `View ${label}`

        tree.add(text, true, action, {
          data: { url, item, keys, columns: detailColumns || columns },
          row: args,
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
  const toolbar = useMemo(() => ({
    label: 'Crud actions toolbar',
    ...(initialToolbar || {}),
    groups: [
      ...(table.action.create ? [
        {
          text: 'New',
          icon: 'plus-circle',
          split: true,
          onClick: () => {
            tree.add('Create', true)
          },
          ...(table.action.restore ? {
            dropdown: {
              items: [
                {
                  text: 'Restore',
                  icon: 'trash',
                  attrs: {
                    class: table.params.trash ? 'active' : null,
                  },
                  onClick: () => table.setParams(params => ({
                    ...params,
                    trash: params.trash ? 0 : 1,
                  })),
                },
              ],
            },
          } : {}),
        },
      ] : []),
      ...(initialToolbar?.groups || []),
    ]
  }), [table.action, table.params.trash])

  useEffect(() => {
    if (undefined === table.params.trash) {
      return
    }

    tree.reset([
      { ...tree.getItem('main'), text: table.params.trash ? 'Main (trash)' : 'Main' }
    ])
  }, [table.params.trash])
  useEffect(() => () => {
    crudRef.current.loaded = false
    cancel()
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
      {'main' === tree.activeId ? (
        <PaginatedTable {...table} />
      ) : (
        renderContent(tree.activeItem)
        || renderCrudContent(tree.activeItem, endpoint, form)
      )}
    </Panel>
  )
}

export const renderCrudContent = (tab, endpoint, form) => (
  (['create', 'edit'].includes(tab?.tag) && (
    <CrudForm key={tab[tab.idKey]} tab={tab} {...{ endpoint, ...form }} />
  ))
  || ('view' === tab?.tag && <CrudView key={tab[tab.idKey]} tab={tab} />)
  || <ErrorPage />
)

export const CrudView = ({
  columns: viewColumns,
  toolbar: viewToolbar,
  tab,
}) => {
  const {
    data: { item, columns: tabColumns } = {},
    close,
  } = tab
  const columns = viewColumns || tabColumns || []
  const toolbar = viewToolbar || {
    direction: 'end',
    groups: [
      {
        text: 'Close',
        icon: 'x-circle',
        size: 'sm',
        onClick: () => close && close(),
      },
    ]
  }

  return (
    <TableView columns={columns} item={item} toolbar={toolbar} />
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