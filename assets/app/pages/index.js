import { Suspense, lazy } from 'preact/compat'
import Router from 'preact-router'
import { withContext } from '@app/context'
import Loading from '@app/components/loading'
import HomePage from './home'
import NotFoundPage from './404'

const DashboardPage = lazy(() => import('./dashboard'))

export default withContext(({
  ctx: {
    history,
  },
}) => {
  return (
    <Suspense fallback={<Loading />}>
      <Router history={history.current}>
        <HomePage path="/" />
        <DashboardPage path="/dashboard/:rest*" />
        <NotFoundPage default />
      </Router>
    </Suspense>
  )
}, null)