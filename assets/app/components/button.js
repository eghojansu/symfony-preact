import { clsx } from '../lib/common'
import { IconLabel } from './visual'
import { NavDropdown } from './tree'

export const Toolbar = ({
  groups,
  label,
  direction,
  class: clsa,
}) => {
  const attr = {
    class: clsx('btn-toolbar', direction && `justify-content-${direction}`, clsa),
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
  split,
  size,
  dropdowns,
  dropdownLabel = 'Toggle dropdown',
  variant = 'secondary',
  ...actionProps
}) => {
  const attr = {
    class: clsx('btn-group', size && `btn-group-${size}`, groupClass),
    role: 'group',
    ...(label ? { 'aria-label': label } : {}),
  }

  return (
    <div {...attr}>
      <Action {...{ class: clsa, variant, ...actionProps }} />
      {(items || []).map((item, idx) => (<Action key={item.id || idx} {...item} />))}
      {split && (
        <button type="button" class={clsx('btn', `btn-${variant}`, 'dropdown-toggle dropdown-toggle-split', clsa)} data-bs-toggle="dropdown" aria-expanded="false">
          <span class="visually-hidden">{dropdownLabel}</span>
        </button>
      )}
      {dropdowns && <NavDropdown {...dropdowns} />}
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
  type = 'button',
  variant = 'secondary',
  ...props
}) => {
  const link = !!(url || 'a' === type)
  const inactive = (disabled || processing) ? true : false
  const actionProps = {
    ...props,
    class: clsx('btn', `btn-${variant}`, clsa, link && inactive && 'disabled'),
    ...(link ? { href: url || '#' } : { type, disabled: inactive }),
    ...(onClick ? { onClick } : {}),
  }
  const labelElement = <IconLabel text={text} icon={icon} processing={processing} />

  if (link) {
    return <a {...actionProps}>{labelElement}</a>
  }

  return <button {...actionProps}>{labelElement}</button>
}

export const Pagination = ({

}) => {
  return (
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}