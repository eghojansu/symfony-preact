import { useEffect, useRef, useState } from 'preact/hooks'
import { withContext } from '@app/context'
import { caseKebab, clsx, normalizeMenu } from '@app/lib/common'
import Panel from '@app/components/panel'
import { IconSpinner, IconLabel } from '@app/components/visual'
import { Toolbar } from '@app/components/button'

export default withContext(({
  ctx: {
    request,
  },
}) => {
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
  const loadMenu = async () => {
    const { data } = await request('/api/menu', { signal: controller.current.signal })

    menuSet(normalizeMenu(data))
  }

  useEffect(() => {
    loadMenu()

    return () => {
      controller.current.abort()
    }
  }, [])

  return (
    <Panel title="Manage Menu">
      <div class="row">
        {groups.map(group => (
          <div key={group.id} class="col">
            <h3 class="fs-5 border-bottom pb-3 mb-3">{group.text}</h3>
            {group.id in menu ? (
              <Tree id={group.id} items={menu[group.id]} />
            ) : <IconSpinner />}
          </div>
        ))}
      </div>
    </Panel>
  )
})

const Tree = ({
  id,
  items,
  class: clsa,
}) => {
  return (
    <div id={id} class={clsx('list-group list-group-flush', clsa)}>
      {items.map(item => (
        <TreeItem
          key={item.id}
          item={item} />
      ))}
    </div>
  )
}
const TreeItem = ({
  item,
}) => {
  const {
    id,
    text,
    icon,
    items,
    active,
  } = item
  const hasChildren = items?.length > 0
  const elementId = `list-group-${caseKebab(id)}`
  const itemAttr = {
    class: clsx(
      'list-group-item d-flex editable-menu-row',
      active && 'active',
    ),
    ...(hasChildren ? {
      'aria-current': 'true',
      'aria-expanded': 'false',
      'aria-controls': elementId,
    } : {}),
    ...(active ? {
      'aria-current': 'true',
    } : {}),
  }
  const groups = [
    {
      id: 'remove',
      icon: 'trash',
      variant: 'danger',
      size: 'sm',
      items: [
        {
          id: 'up',
          icon: 'caret-up',
        },
        {
          id: 'down',
          icon: 'caret-down',
        },
        {
          id: 'url',
          icon: 'globe',
        },
        ...(hasChildren ? [
          {
            id: 'toggle',
            icon: 'eye',
            variant: 'info',
          },
        ] : [])
      ]
    },
  ]

  return (
    <>
      <div {...itemAttr}>
        <div class="p-1 me-2"><i class={clsx(`bi-${icon || 'bullseye'}`)}></i></div>
        <input type="text" value={text} />
        <Toolbar groups={groups} class="ms-auto" />
      </div>
      {hasChildren && (
        <Tree
          id={elementId}
          class="collapse"
          items={items} />
      )}
    </>
  )
}