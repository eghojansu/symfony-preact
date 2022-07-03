import { clsx } from '../lib/common'
import { IconLabel } from './visual'
import { NavDropdown } from './tree'

export const Toolbar = ({
  groups,
  label,
  direction,
  class: clsa,
  onClick,
}) => {
  const attr = {
    class: clsx('btn-toolbar', direction && `justify-content-${direction}`, clsa),
    role: 'toolbar',
    ...(label ? { 'aria-label': label } : {}),
  }
  const handleClick = group => args => onClick({ ...args, group })

  return (
    <div {...attr}>
      {groups.map((group, idx) => (
        <Group key={group.id || idx} {...{
          ...(onClick ? { onItemClick: handleClick(group) } : {}),
          ...group,
        }} />
      ))}
    </div>
  )
}

export const Group = ({
  id,
  text,
  icon,
  label,
  items,
  groupClass,
  class: clsa,
  split,
  size,
  onItemClick,
  dropdown,
  dropdownLabel = 'Toggle dropdown',
  variant = 'secondary',
  ...actionProps
}) => {
  const grouped = items?.length > 0 || (dropdown && split)
  const attr = {
    class: clsx(grouped && 'btn-group', grouped && size && `btn-group-${size}`, groupClass),
    role: grouped ? 'group' : null,
    ...(label ? { 'aria-label': label } : {}),
  }
  const handleClick = item => args => onItemClick({ ...args, item })

  return (
    <div {...attr}>
      {(id || text || icon) && <Action {...{
        id,
        text,
        icon,
        variant,
        class: clsx(clsa, dropdown && !split && 'dropdown-toggle', size && `btn-${size}`),
        ...(dropdown && !split ? {
          'data-bs-toggle': 'dropdown',
          'aria-expanded': 'false',
        } : {}),
        ...actionProps
      }} />}
      {items && items.map((item, idx) => (
        <Action key={item.id || idx} {...{
          ...(onItemClick ? { onClick: handleClick(item)} : {}),
          ...item,
        }} />
      ))}
      {split && dropdown && (
        <button type="button" class={clsx('btn', `btn-${variant}`, 'dropdown-toggle dropdown-toggle-split')} data-bs-toggle="dropdown" aria-expanded="false">
          <span class="visually-hidden">{dropdownLabel}</span>
        </button>
      )}
      {dropdown && <NavDropdown {...dropdown} />}
    </div>
  )
}

export const Action = ({
  url,
  text,
  icon,
  class: clsa,
  onClick,
  disabled,
  processing,
  outline,
  type = 'button',
  variant = 'secondary',
  ...props
}) => {
  const link = !!(url || 'a' === type)
  const inactive = (disabled || processing) ? true : false
  const handleClick = event => onClick({ event })
  const actionProps = {
    ...props,
    class: clsx('btn', `btn-${outline ? 'outline-' : '' }${variant}`, clsa, link && inactive && 'disabled'),
    ...(link ? { href: url || '#' } : { type, disabled: inactive }),
    ...(onClick ? { onClick: handleClick } : {}),
  }
  const labelElement = <IconLabel text={text} icon={icon} processing={processing} />

  if (link) {
    return <a {...actionProps}>{labelElement}</a>
  }

  return <button {...actionProps}>{labelElement}</button>
}