import { useEffect, useRef } from 'preact/hooks'
import { caseKebab, clsx, random } from '../lib/common'
import { itemMatcher } from '../lib/tree'
import { IconLabel } from './visual'

const NavDropdownItem = ({
  item,
  activeId,
  activeClass,
}) => {
  const {
    text,
    icon,
    url,
    onClick,
    attrs = {}
  } = item
  const activeCheck = itemMatcher(activeId)
  const linkAttr = {
    ...attrs,
    class: clsx('dropdown-item', activeCheck(item) && (activeClass || 'active'), item.attrs?.class),
    href: url || '#',
    ...(onClick ? { onClick: event => (
      event.preventDefault() || onClick({ event, item })
    )} : {}),
  }

  return (
    <li>
      <a {...linkAttr}>
        <IconLabel text={text} icon={icon} />
      </a>
    </li>
  )
}
export const NavDropdown = ({
  items,
  activeId,
  activeClass,
  parentId,
  options,
  onClick,
}) => {
  const {
    class: dropdownClass = 'dropdown-menu',
    clsa = null,
    end = false,
  } = options || {}
  const dropdownAttr = {
    class: clsx(dropdownClass, clsa, end && 'dropdown-menu-end'),
    ...(parentId ? { 'aria-labelledby': parentId } : {}),
  }
  const handleClick = onClick ? (args => onClick({ ...args, items })) : null

  return (
    <ul {...dropdownAttr}>
      {items.map((item, idx) => (<NavDropdownItem
        key={item.id || idx}
        item={{ onClick: handleClick, ...item }}
        activeClass={activeClass}
        activeId={activeId} />
      ))}
    </ul>
  )
}

const NavItem = ({ item, activeId, onClose, onClick, options = {} }) => {
  const ref = useRef()
  const {
    itemClass = 'dropdown',
    linkClass = 'dropdown-toggle',
    activeClass,
    ...dropdownOptions
  } = options
  const {
    id = random(6),
    url,
    text,
    icon,
    items,
    closable,
    attrs,
  } = item
  const hasChildren = items?.length > 0
  const elementId = `nav-${caseKebab(id)}`
  const activeCheck = itemMatcher(activeId)
  const handleClose = event => (
    onClose && (
      event.preventDefault()
      || event.stopPropagation()
      || onClose({ event, item: { id, ...item } })
    )
  )
  const active = activeCheck(item)
  const itemAttr = {
    class: clsx('nav-item', hasChildren && itemClass),
  }
  const { title, class: clsa, ...attrsRest } = attrs || {}
  const linkAttr = {
    ...attrsRest,
    class: clsx(
      'nav-link',
      hasChildren && linkClass,
      active && (activeClass || 'active'),
      closable && 'd-flex',
      clsa,
    ),
    href: hasChildren || !url ? '#' : url,
    'aria-current': active ? 'page' : null,
    ...(hasChildren ? {
      id: elementId,
      role: 'button',
      'data-bs-toggle': 'dropdown',
      'aria-expanded': 'false',
    } : {}),
    ...(onClick ? { onClick: event => (
      event.preventDefault() || onClick({ event, item: { id, ...item } })
    )} : {}),
  }

  useEffect(() => {
    if (title) {
      new bootstrap.Tooltip(ref.current)
    }
  }, [])

  return (
    <li {...itemAttr}>
      <a {...linkAttr}>
        <span ref={ref} title={title} class="text"><IconLabel text={text} icon={icon} /></span>
        {closable && <i class="bi-x-circle ms-2" onClick={handleClose}></i>}
      </a>
      {hasChildren && (<NavDropdown
        items={items}
        parentId={elementId}
        activeId={activeId}
        activeClass={activeClass}
        options={dropdownOptions} />
      )}
    </li>
  )
}
export const Nav = ({
  items,
  idKey = 'id',
  class: rootClass = 'nav',
  clsa,
  variant,
  activeClass,
  activeId,
  onClose,
  onSelect,
  dropdown = {},
}) => (
  <ul class={clsx(rootClass, variant && `nav-${variant}`, clsa)}>
    {items.map((item, idx) => (
      <NavItem
        key={item[idKey] || idx}
        item={item}
        activeId={activeId}
        onClose={onClose}
        onClick={onSelect}
        options={{ activeClass, ...dropdown }} />
    ))}
  </ul>
)

export const NavTab = props => (<Nav variant="tabs" {...props} />)

const ListGroupItem = ({
  item,
  flush,
  activeId,
  activeClass,
  onClick,
}) => {
  const {
    id,
    url,
    text,
    icon,
    items,
  } = item
  const hasChildren = items?.length > 0
  const elementId = `list-group-${caseKebab(id)}`
  const activeCheck = itemMatcher(activeId)
  const active = activeCheck(item)
  const linkAttr = {
    class: clsx(
      'list-group-item list-group-item-action',
      active && (activeClass || 'active'),
      hasChildren && 'd-flex',
    ),
    href: url || '#',
    ...(hasChildren ? {
      href: `#${elementId}`,
      'data-bs-toggle': 'collapse',
      'aria-current': 'true',
      'aria-expanded': 'false',
      'aria-controls': elementId,
    } : {}),
    ...(active ? {
      'aria-current': 'true',
    } : {}),
    ...(onClick ? {
      onClick: event => onClick && onClick({ event, item })
    } : {}),
  }

  return (
    <>
      <a {...linkAttr}>
        <IconLabel text={text} icon={icon} />
        {hasChildren && <i class="bi-caret-down ms-auto"></i>}
      </a>
      {hasChildren && (
        <ListGroup
          id={elementId}
          class="collapse"
          items={items}
          flush={flush}
          onClick={onClick}
          activeId={activeId}
          activeClass={activeClass} />
      )}
    </>
  )
}
export const ListGroup = ({
  id,
  items,
  flush,
  class: clsa,
  activeId,
  activeClass,
  onClick,
}) => {
  const attr = {
    id,
    class: clsx('list-group', flush && 'list-group-flush', clsa),
  }

  return (
    <div {...attr}>
      {items.map(item => (
        <ListGroupItem
          key={item.id}
          item={item}
          flush={flush}
          onClick={onClick}
          activeClass={activeClass}
          activeId={activeId} />
      ))}
    </div>
  )
}