import Router from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { withContext } from '@app/context'
import { WaitingPage, NotFoundPage } from '@app/components/fallback'
import HomePage from './home'

const DashboardPage = lazy(() => import('./dashboard'))

export default withContext(({
  ctx: {
    history,
  },
}) => {
  return (
    <Suspense fallback={<WaitingPage />}>
      <Router history={history.current}>
        <HomePage path="/" />
        <DashboardPage path="/dashboard/:rest*" />
        <NotFoundPage default />
      </Router>
    </Suspense>
  )
}, null)