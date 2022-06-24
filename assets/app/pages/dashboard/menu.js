import { useEffect, useRef, useState } from 'preact/hooks'
import { withGranted } from '@app/context'
import { clsx, normalizeMenu } from '@app/lib/common'
import useTree from '@app/lib/tree'
import Panel from '@app/components/panel'
import { Nav } from '@app/components/tree'
import { IconSpinner, IconLabel } from '@app/components/visual'
import { Toolbar } from '@app/components/button'

export default withGranted(MainPage)

function MainPage({
  ctx: {
    request,
  },
}) {
  const controller = useRef(new AbortController())
  const groups = [
    {
      id: 'db',
      text: 'App Menu',
    },
    {
      id: 'top',
      text: 'Account Menu',
    },
  ]
  const [menu, menuSet] = useState({})
  const { items, activeId, setActive, activeItem, addItem: addTab, handleTabSelect } = useTree([
    { text: 'Menu' },
  ])
  const loadMenu = async () => {
    const { data } = await request('/api/menu', { signal: controller.current.signal })

    menuSet(normalizeMenu(data))
  }
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
  const createActionGroupHandler = group => ({ action: { id },  tree }) => {
    const last = tree[tree.length - 1]

    if ('up' === id) {
      menuSet(menu => ({
        ...menu,
        [group.id]: updatePos(menu[group.id], tree),
      }))

      return
    }

    if ('down' === id) {
      menuSet(menu => ({
        ...menu,
        [group.id]: updatePos(menu[group.id], tree, -1),
      }))

      return
    }

    if ('add' === id) {
      console.log(last)
      addTab({
        id: 'add',
        text: `Add Child`,
      })

      return
    }

    console.log('Unhandled action ' + id)
  }

  useEffect(() => {
    loadMenu()

    return () => {
      controller.current.abort()
    }
  }, [])

  return (
    <Panel title="Manage Menu">
      <Nav items={items} activeId={activeId} onSelect={handleTabSelect} variant="tabs" />
      {
        ('Menu' === activeId && (
          <MainTab
            groups={groups}
            menu={menu}
            createActionGroupHandler={createActionGroupHandler} />
        ))
        || ('add' === activeItem.id && (
          <CreateForm />
        ))
        || null
      }
    </Panel>
  )
}

const MainTab = ({
  groups,
  menu,
  createActionGroupHandler,
}) => (
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
const CreateForm = ({

}) => {
  return (
    <div>Form</div>
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
  const {
    text,
    icon,
    items,
    active,
  } = item
  const hasChildren = items?.length > 0
  const itemAttr = {
    class: clsx(
      'list-group-item d-flex editable-menu-row',
      active && 'active',
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
        {
          id: 'add',
          icon: 'plus-circle',
          variant: 'primary',
        },
        {
          id: 'edit',
          icon: 'pencil',
          variant: 'success',
        },
        {
          id: 'remove',
          icon: 'trash',
          variant: 'danger',
        },
        {
          id: 'up',
          icon: 'caret-up',
          disabled: pos === 0,
        },
        {
          id: 'down',
          icon: 'caret-down',
          disabled: pos === last,
        },
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