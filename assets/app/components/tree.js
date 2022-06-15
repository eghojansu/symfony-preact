import { caseKebab, clsx } from '../lib/common'

const activeChecker = activeUrl => item => item?.url && item.url === activeUrl
const NavLabel = ({ text, icon }) => (
  <>
    {icon && <i class={clsx(`bi-${icon}`, text && 'me-2')}></i>}
    {text}
  </>
)
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
  const active = activeCheck(item) || (hasChildren && items.some(activeCheck))
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
      <a {...linkAttr}><NavLabel text={text} icon={icon} /></a>
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
        <NavLabel text={text} icon={icon} />
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
        item={item}
        activeClass={activeClass}
        activeUrl={activeUrl} />
      ))}
    </ul>
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
      {(items || []).map(item => (
        <NavItem
          item={item}
          activeUrl={activeUrl}
          options={{ activeClass, ...dropdown }} />
      ))}
    </ul>
  )
}