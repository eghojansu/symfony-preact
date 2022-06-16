import { clsx } from '../lib/common'

export default ({
  title,
  clsa,
  items,
  children,
}) => {
  return (
    <div class={clsx('card', clsa)}>
      <div class="card-header">
        <div class="row">
          {title && (
            <div class="col col-md-6">
              <h1 class="fs-5 pb-3">{title}</h1>
            </div>
          )}
        </div>
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a class="nav-link active" href="#">Active</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled">Disabled</a>
          </li>
        </ul>
      </div>
      <div class="card-body">{children}</div>
    </div>
  )
}