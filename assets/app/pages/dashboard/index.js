import Router from 'preact-router'
import { withContext } from '../../context'
import { Nav, ListGroup } from '../../components/tree'
import { IconSpinner } from '../../components/icon'
import HomePage from './home'
import NotFoundPage from './404'

export default withContext(({
  ctx: {
    app,
    menu,
  },
  path,
  url,
}) => {
  const cut = path.indexOf(':')
  const prefix = cut < 0 ? path : path.slice(0, cut - 1)

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
                <Nav items={menu.top} activeUrl={url} options={{
                  class: 'navbar-nav ms-auto mb-2 mb-lg-0',
                  dropdown: { end: true },
                }} /> :
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
              <ListGroup items={menu.db} activeUrl={url} flush={true} /> :
              <div class="text-center"><IconSpinner variant="secondary" mode="grow" /></div>
          )}
        </div>
      </nav>
      <main class="p-3">
        <Router>
          <HomePage path={prefix} />
          <NotFoundPage default />
        </Router>
      </main>
    </>
  )
})