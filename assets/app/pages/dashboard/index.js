import Router from 'preact-router'
import { withContext } from '../../context'
import { Nav } from '../../components/tree'
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
          <a class="navbar-brand" href="/">{app.name}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <Nav items={menu?.top} activeUrl={url} options={{
              class: 'navbar-nav ms-auto mb-2 mb-lg-0',
              dropdown: { end: true },
            }} />
          </div>
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