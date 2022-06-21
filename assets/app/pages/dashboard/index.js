import Router from 'preact-router'
import { lazy, Suspense } from 'preact/compat'
import { withContext } from '@app/context'
import { Nav, ListGroup } from '@app/components/tree'
import { IconSpinner } from '@app/components/visual'
import { WaitingPage, NotFoundPage } from '@app/components/fallback'
import { pathPrefix } from '@app/lib/common'
import HomePage from './home'

const AccountPage = lazy(() => import('./account'))
const UserPage = lazy(() => import('./user'))

export default withContext(({
  ctx: {
    app,
    menu,
  },
  path,
  url,
}) => {
  const prefix = pathPrefix(path)

  return (
    <>
      <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
          <button class="navbar-toggler d-block me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbar-side" aria-controls="navbar-side" aria-expanded="false" aria-label="Toggle side navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <a class="navbar-brand" href="/">{app.name}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-top" aria-controls="navbar-top" aria-expanded="false" aria-label="Toggle top navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbar-top">
            {(
              menu?.top ?
                <Nav items={menu.top} activeId={url} class="navbar-nav ms-auto mb-2 mb-lg-0" dropdown={{ end: true }} /> :
                <div class="ms-auto"><IconSpinner variant="secondary" mode="grow" /></div>
            )}
          </div>
        </div>
      </nav>
      <nav class="offcanvas offcanvas-start" tabindex="-1" id="navbar-side" aria-labelledby="navbar-side-label">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="navbar-side-label">{app.name}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0">
          {(
            menu?.db ?
              <ListGroup items={menu.db} activeId={url} flush={true} /> :
              <div class="text-center"><IconSpinner variant="secondary" mode="grow" /></div>
          )}
        </div>
      </nav>
      <main class="p-3">
        <Suspense loading={<WaitingPage />}>
          <Router>
            <HomePage path={prefix} />
            <AccountPage path={`${prefix}/account/:rest*`} />
            <UserPage path={`${prefix}/adm/user`} />
            <NotFoundPage default />
          </Router>
        </Suspense>
      </main>
    </>
  )
})