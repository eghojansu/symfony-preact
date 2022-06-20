import { clsx } from '../lib/common'
import { Nav } from './tree'
import { Toolbar } from './button'

export default ({
  title,
  class: clsa,
  items,
  toolbar,
  children,
  activeId,
  tabIdKey = 'id',
  onTabClose,
  onTabSelect,
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
          {toolbar && (
            <div class="col col-md-6">
              <Toolbar {...{
                ...toolbar,
                class: clsx(toolbar.class, 'justify-content-end'),
              }} />
            </div>
          )}
        </div>
        {items && (
          <Nav
            items={items}
            idKey={tabIdKey}
            activeId={activeId}
            onClose={onTabClose}
            onClick={onTabSelect}
            options={{ clsa: 'nav-tabs card-header-tabs' }} />
        )}
      </div>
      <div class="card-body">{children}</div>
    </div>
  )
}