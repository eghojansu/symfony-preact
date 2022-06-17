import { clsx } from '../lib/common'
import { Nav } from './tree'
import { Toolbar } from './action'

export default ({
  title,
  class: clsa,
  items,
  toolbars,
  children,
  activeUrl,
}) => {
  return (
    <div class={clsx('card', clsa)}>
      <div class="card-header">
        <div class="row">
          {title && (
            <div class="col col-md-6">
              <h1 class={clsx('fs-5', items && 'pb-3')}>{title}</h1>
            </div>
          )}
          {toolbars && (
            <div class="col col-md-6">
              <Toolbar {...toolbars} />
            </div>
          )}
        </div>
        {items && (
          <Nav items={items} activeUrl={activeUrl} options={{ clsa: 'nav-tabs card-header-tabs' }} />
        )}
      </div>
      <div class="card-body">{children}</div>
    </div>
  )
}