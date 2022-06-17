import { clsx } from '../lib/common'
import { IconLabel } from './icon'
import { NavDropdown } from './tree'

export const Toolbar = ({
  groups,
  label,
  class: clsa,
}) => {
  const attr = {
    class: clsx('btn-toolbar', clsa),
    role: 'toolbar',
    ...(label ? { 'aria-label': label } : {}),
  }

  return (
    <div {...attr}>
      {groups.map((group, idx) => (<Group key={group.id || idx} {...group} />))}
    </div>
  )
}

export const Group = ({
  label,
  items,
  class: clsa,
  groupClass,
  dropdowns,
  dropdownLabel = 'Toggle dropdown',
  variant = 'secondary',
  ...props
}) => {
  const last = items.length
  const attr = {
    class: clsx('btn-group', groupClass),
    role: 'group',
    ...(label ? { 'aria-label': label } : {}),
  }

  return (
    <div {...attr}>
      <Action {...{ class: clsa, variant, ...props }} />
      {split && (
        <button type="button" class={clsx('btn', `btn-${variant}`, 'dropdown-toggle dropdown-toggle-split', clsa)} data-bs-toggle="dropdown" aria-expanded="false">
          <span class="visually-hidden">{dropdownLabel}</span>
        </button>
      )}
      {(items || []).map((item, idx) => (<Action key={item.id || idx} {...item} />))}
      {dropdowns && <NavDropdown {...dropdowns} />}
    </div>
  )
}

const Action = ({
  text,
  icon,
  class: clsa,
  url,
  onClick,
  dropdown,
  iconOnly,
  processing,
  processingText = 'Loading...',
  type = 'button',
  variant = 'secondary',
  ...props
}) => {
  const link = !!(url || 'a' === type)
  const itemAttrs = {
    ...props,
    class: clsx('btn', `btn-${variant}`, clsa, link && processing && 'disabled', dropdown && 'dropdown-toggle'),
    ...(link ? { href: url || '#' } : { type, disabled: processing }),
    ...(dropdown ? { 'data-bs-toggle': 'dropdown', 'aria-expanded': 'false' } : {}),
    ...(onClick ? { onClick } : {}),
  }
  const label = iconOnly ? (
    <span class="visually-hidden">{text}</span>
  ) : (
    processing ? (
      <>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        <span class="visually-hidden">{processingText}</span>
      </>
    ) : (<IconLabel text={text} icon={icon} />)
  )

  if (link) {
    return <a {...itemAttrs}>{label}</a>
  }

  return <button {...itemAttrs}>{label}</button>
}

export default Action