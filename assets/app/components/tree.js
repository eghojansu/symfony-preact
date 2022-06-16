import { caseKebab, clsx } from '../lib/common'
import { IconLabel } from './icon'

const activeChecker = activeUrl => item => item?.url && item.url === activeUrl

const NavDropdownItem = ({
  item,
  activeUrl,
  activeClass,
}) => {
  const {
    text,
    icon,
    url,
    attrs = {}
  } = item
  const activeCheck = activeChecker(activeUrl)
  const linkAttr = {
    ...attrs,
    class: clsx('dropdown-item', activeCheck(item) && (activeClass || 'active'), item.attrs?.class),
    href: url || '#',
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
  activeUrl,
  activeClass,
  parentId,
  options,
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

  return (
    <ul {...dropdownAttr}>
      {items.map(item => (<NavDropdownItem
        key={item.id}
        item={item}
        activeClass={activeClass}
        activeUrl={activeUrl} />
      ))}
    </ul>
  )
}

const NavItem = ({ item, activeUrl, options = {} }) => {
  const {
    itemClass = 'dropdown',
    linkClass = 'dropdown-toggle',
    activeClass,
    ...dropdownOptions
  } = options
  const {
    id,
    url,
    text,
    icon,
    items,
    attrs = {},
  } = item
  const hasChildren = items?.length > 0
  const elementId = `nav-${caseKebab(id)}`
  const activeCheck = item => item.url && item.url === activeUrl
  const active = activeCheck(item)
  const itemAttr = {
    class: clsx('nav-item', hasChildren && itemClass),
  }
  const linkAttr = {
    ...attrs,
    class: clsx(
      'nav-link',
      hasChildren && linkClass,
      active && (activeClass || 'active'),
      attrs.class,
    ),
    href: hasChildren || !url ? '#' : url,
    'aria-current': active ? 'page' : null,
    ...(hasChildren ? {
      id: elementId,
      role: 'button',
      'data-bs-toggle': 'dropdown',
      'aria-expanded': 'false',
    } : {}),
  }

  return (
    <li {...itemAttr}>
      <a {...linkAttr}><IconLabel text={text} icon={icon} /></a>
      {hasChildren && (<NavDropdown
        items={items}
        parentId={elementId}
        activeUrl={activeUrl}
        activeClass={activeClass}
        options={dropdownOptions} />
      )}
    </li>
  )
}
export const Nav = ({ items, activeUrl, options = {} }) => {
  const {
    class: rootClass = 'nav',
    clsa,
    activeClass,
    dropdown = {},
  } = options

  return (
    <ul class={clsx(rootClass, clsa)}>
      {items.map(item => (
        <NavItem
          key={item.id}
          item={item}
          activeUrl={activeUrl}
          options={{ activeClass, ...dropdown }} />
      ))}
    </ul>
  )
}

const ListGroupItem = ({
  item,
  flush,
  activeUrl,
  activeClass,
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
  const activeCheck = item => item.url && item.url === activeUrl
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
          clsa="collapse"
          items={items}
          flush={flush}
          activeUrl={activeUrl}
          activeClass={activeClass} />
      )}
    </>
  )
}
export const ListGroup = ({
  id,
  items,
  flush,
  clsa,
  activeUrl,
  activeClass,
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
          activeClass={activeClass}
          activeUrl={activeUrl} />
      ))}
    </div>
  )
}