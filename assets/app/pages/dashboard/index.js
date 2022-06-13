import Router from 'preact-router'
import { withContext } from '../../context'
import HomePage from './home'
import NotFoundPage from './404'

export default withContext(({ path }) => {
  const cut = path.indexOf(':')
  const prefix = cut < 0 ? path : path.slice(0, cut - 1)

  return (
    <Router>
      <HomePage path={prefix} />
      <NotFoundPage default />
    </Router>
  )
})