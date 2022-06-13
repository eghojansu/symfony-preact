import { Suspense, lazy } from 'preact/compat'
import Router from 'preact-router'
import { withContext } from '../context'
import HomePage from './home'
import LoadingPage from './loading'
import NotFoundPage from './404'

const DashboardPage = lazy(() => import('./dashboard'))

export default withContext(({
  ctx: {
    history,
  },
}) => {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Router history={history.current}>
        <HomePage path="/" />
        <DashboardPage path="/dashboard/:rest*" />
        <NotFoundPage default />
      </Router>
    </Suspense>
  )
}, null)