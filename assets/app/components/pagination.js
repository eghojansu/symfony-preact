import { clsx, range } from '../lib/common'
import notify from '../lib/notify'

export const PaginationInfo = ({
  page = 0,
  size = 0,
  count = 0,
  total = 0,
}) => {
  const start = (page - 1) * size + 1
  const to = start + count - 1

  return (
    <div class="fst-italic">Displaying {start} &ndash; {to} of {total} entries</div>
  )
}

export const PaginationSizer = ({
  size = 3,
  currentSize = 3,
  onChange = e => null,
}) => {
  return (
    <select value={currentSize} onChange={onChange} class="form-select d-inline-block" style="max-width: 90px">
      <option value="">Page Size</option>
      {range(5, size, size).map(size => (
        <option value={size}>{size}</option>
      ))}
    </select>
  )
}

export default ({
  page = 1,
  pages = 1,
  direction,
  onChange,
  label = 'Page navigation',
}) => {
  const adjacent = 1
  const start = Math.max(page - adjacent, 2)
  const end = Math.min(page + adjacent, pages - 1)
  const parts = range(end - start + 1, start)
  const handle = (disabled, page) => event => event.preventDefault() || disabled || (onChange && onChange({ event, page }))
  const handleCustom = event => {
    if ('Enter' !== event.key) {
      return
    }

    const value = Number.parseInt(event.target.value)
    const message = (
      (isNaN(value) && 'Please input a number only')
      || ((value == page || !onChange) && 'No changes')
      || ((value < 1 || value > pages) && 'Out of range')
      || null
    )

    if (message) {
      notify(message)

      return
    }

    onChange({ event, page: value })
  }

  return (
    <nav aria-label={label}>
      <ul class={clsx('pagination', direction && `justify-content-${direction}`)}>
        <li class={clsx('page-item', page < 2 && 'disabled')}>
          <a class="page-link" href="#" aria-label="Previous" onClick={handle(page < 2, Math.max(page - 1, 1))}>
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class={clsx('page-item', 1 === page && 'active')} aria-current={1 === page ? 'page' : null }>
          <a class="page-link" href="#" onClick={handle(1 === page, 1)}>1</a>
        </li>
        {parts[0] > 2 && (
          <li class="page-item disabled">
            <a class="page-link" href="#">&hellip;</a>
          </li>
        )}
        {parts.map(part => (
          <li class={clsx('page-item', page === part && 'd-flex')} aria-current={part === page ? 'page' : null }>
            {part === page ? (
              <input type="text" class="page-custom" value={page} onKeyDown={handleCustom} />
            ) : <a class="page-link" href="#" onClick={handle(part === page, part)}>{part}</a>}
          </li>
        ))}
        {parts[parts.length - 1] < (pages - adjacent) && (
          <li class="page-item disabled">
            <a class="page-link" href="#">&hellip;</a>
          </li>
        )}
        {parts[0] < pages && (
          <li class={clsx('page-item', pages === page && 'active')} aria-current={pages === page ? 'page' : null }>
            <a class="page-link" href="#" onClick={handle(pages === page, pages)}>{pages}</a>
          </li>
        )}
        <li class={clsx('page-item', pages <= page && 'disabled')}>
          <a class="page-link" href="#" aria-label="Next" onClick={handle(pages <= page, Math.min(page + 1, pages))}>
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  )
}