import { createContext } from 'preact'
import { useRef, useState, useEffect, useContext, useMemo } from 'preact/hooks'
import { withGranted } from '@app/context'
import { clsx, normalizeMenu } from '@app/lib/common'
import { useAction } from '@app/lib/table'
import notify, { confirm } from '@app/lib/notify'
import useTree from '@app/lib/tree'
import Panel from '@app/components/panel'
import Form from '@app/components/form-auto'
import { IconSpinner, IconLabel } from '@app/components/visual'
import { Toolbar } from '@app/components/button'

export default withGranted(MainPage)

function MainPage({
  ctx: {
    request,
    loadMenu,
  },
}) {
  const groups = [
    {
      id: 'db',
      name: 'App Menu',
      text: 'App Menu',
    },
    {
      id: 'top',
      name: 'Account Menu',
      text: 'Account Menu',
    },
  ]
  const [menu, menuSet] = useState({})
  const action = useAction(true)
  const menuRef = useRef({
    loaded: true,
    cancel: new AbortController(),
  })
  const toolbar = useMemo(() => ({
    groups: [
      ...action.withAction('create', {
        text: 'New',
        icon: 'plus-circle',
        variant: 'primary',
        dropdown: {
          items: groups,
          onClick: ({ item }) => {
            addTab(`Add child of ${item.name}`, true, 'add', {
              data: { parent: item },
            })
          },
        },
      }, true)
    ]
  }), [action.action.create])
  const {
    items,
    activeId,
    activeItem,
    add: addTab,
    handleTabSelect,
    handleTabClose,
  } = useTree(tree => {
    tree.add('Menu')
  }, null, tab => ({ ...tab, refresh: loadBoth }))
  const loadData = async () => {
    const { data } = await request(endpoint, {
      signal: menuRef.current.cancel.signal,
    })

    menuRef.current.loaded && menuSet(normalizeMenu(data))
  }
  const loadBoth = () => {
    loadData()
    loadMenu()
  }
  const cancel = () => menuRef.current.cancel.abort()
  const updatePos = (menu, tree, direction = 1) => {
    const last = tree.length - 1

    tree.reduce((menu, item, depth) => {
      const pos = menu.indexOf(item)

      if (depth === last) {
        const found = menu.splice(pos, 1)

        menu.splice(Math.max(0, pos-direction), 0, ...found)

        return menu
      }

      return menu[pos].items
    }, menu)

    return menu
  }
  const updateDirection = async (url, dir) => {
    const { success, message } = await request(
      `${url}/sort`,
      {
        method: 'PATCH',
        signal: menuRef.current.cancel.signal,
        params: { dir },
      }
    )

    if (success) {
      notify(message, true)
      loadMenu()
    }
  }
  const createActionGroupHandler = group => async ({ action: { id },  tree }) => {
    const [item] = tree.slice(-1)
    const url = `${endpoint}/${item.id}`

    if ('up' === id) {
      updateDirection(url, id)
      menuSet(menu => ({
        ...menu,
        [group.id]: updatePos(menu[group.id], tree),
      }))

      return
    }

    if ('down' === id) {
      updateDirection(url, id)
      menuSet(menu => ({
        ...menu,
        [group.id]: updatePos(menu[group.id], tree, -1),
      }))

      return
    }

    if ('add' === id) {
      addTab(`Add child of ${item.name}`, true, id, {
        data: { parent: item },
      })

      return
    }

    if ('edit' === id) {
      const [parent] = tree.slice(-2, 1)

      addTab(`Edit ${item.name}`, true, id, {
        data: {
          url,
          item,
          parent: parent === item ? groups.find(group => group.id === item.parent) : parent,
        },
      })

      return
    }

    if ('remove' === id) {
      const { isConfirmed, value: { success, message } = {} } = await confirm(
        () => request(url, {
          method: 'DELETE',
        })
      )

      if (isConfirmed && success) {
        notify(message, true)
        loadBoth()
      }

      return
    }

    console.log('Unhandled action ' + id)
  }
  const contextValue = {
    groups,
    action,
    menu,
    createActionGroupHandler,
  }

  useEffect(() => {
    loadData()

    return () => {
      cancel()
      menuRef.current.loaded = false
    }
  }, [])

  return (
    <MenuContext.Provider value={contextValue}>
      <Panel
        title="Manage Menu"
        toolbar={toolbar}
        items={items}
        activeId={activeId}
        onTabClose={handleTabClose}
        onTabSelect={handleTabSelect}>
        {
          ('menu' === activeId && <MainTab />)
          || (['add', 'edit'].includes(activeItem?.tag) && (
            <MenuForm key={activeItem.text} tab={activeItem} />
          ))
          || null
        }
      </Panel>
    </MenuContext.Provider>
  )
}

const endpoint = '/api/menu'

const MenuContext = createContext()
const useMenuContext = () => useContext(MenuContext)
const MainTab = () => {
  const { groups, menu, createActionGroupHandler } = useMenuContext()

  return (
    <div class="row mt-3">
      {groups.map(group => (
        <div key={group.id} class="col">
          <h3 class="fs-5 border-bottom pb-3 mb-3">{group.text}</h3>
          {group.id in menu ? (
            <Tree id={group.id} onAction={createActionGroupHandler(group)} items={menu[group.id]} />
          ) : <IconSpinner />}
        </div>
      ))}
    </div>
  )
}
const MenuForm = ({
  tab: {
    close,
    refresh,
    data: {
      parent,
      item,
      url,
    },
  },
}) => {
  const action = url || endpoint
  const method = item ? 'PUT' : 'POST'
  const extra = {
    parent: parent.id,
  }
  const controls = [
    {
      name: 'parentInfo',
      value: `${parent.id} (${parent.path || '~'})`,
      label: `Parent: ${parent.name}`,
      plain: true,
      extra: { ignore: true },
    },
    {
      name: 'id',
      label: 'Menu ID',
      required: true,
      maxlength: 10,
      once: true,
    },
    {
      name: 'name',
      required: true,
    },
    {
      name: 'path',
      required: true,
    },
    {
      name: 'matcher',
    },
    {
      name: 'hint',
    },
    {
      name: 'active',
      type: 'checkbox',
      value: '1',
      break: true,
    },
    {
      name: 'hidden',
      type: 'checkbox',
      value: '1',
    },
    {
      name: 'roles',
      type: 'choice',
      multiple: true,
      break: true,
      source: '/api/data/roles',
    },
    {
      name: 'icon',
    },
  ]
  const handleSuccess = () => {
    refresh()
    close()
  }

  return (
    <Form
      class="row g-3"
      extra={extra}
      action={action}
      method={method}
      initials={item}
      controls={controls}
      onCancel={close}
      afterSuccess={handleSuccess} />
  )
}

const Tree = ({
  items,
  class: clsa,
  onAction,
}) => {
  const last = items.length - 1

  return (
    <div class={clsx('list-group list-group-flush', clsa)}>
      {items.map((item, pos) => (
        <TreeItem
          key={item.id}
          onAction={onAction}
          pos={pos}
          last={last}
          item={item} />
      ))}
    </div>
  )
}
const TreeItem = ({
  item,
  pos,
  last,
  onAction,
}) => {
  const { action: { withAction }} = useMenuContext()
  const {
    name: text,
    icon,
    items,
  } = item
  const hasChildren = items?.length > 0
  const itemAttr = {
    class: clsx(
      'list-group-item d-flex editable-menu-row',
    ),
  }
  const handleClick = ({ item: action }) => onAction && onAction({
    action,
    tree: [item],
  })
  const handleChildAction = ({ tree, ...args }) => onAction && onAction({
    tree: [item, ...tree],
    ...args,
  })
  const groups = [
    {
      size: 'sm',
      items: [
        ...withAction('create', {
          id: 'add',
          icon: 'plus-circle',
          variant: 'primary',
        }, true),
        ...withAction('update', {
          id: 'edit',
          icon: 'pencil',
          variant: 'success',
        }, true),
        ...withAction('delete', {
          id: 'remove',
          icon: 'trash',
          variant: 'danger',
        }, true),
        ...withAction('update', {
          id: 'up',
          icon: 'caret-up',
          disabled: pos === 0,
        }, true),
        ...withAction('update', {
          id: 'down',
          icon: 'caret-down',
          disabled: pos === last,
        }, true),
      ]
    },
  ]

  return (
    <>
      <div {...itemAttr}>
        <IconLabel text={text} icon={icon || 'bullseye'} />
        <Toolbar groups={groups} onClick={handleClick} class="ms-auto" />
      </div>
      {hasChildren && (
        <Tree items={items} onAction={handleChildAction} />
      )}
    </>
  )
}