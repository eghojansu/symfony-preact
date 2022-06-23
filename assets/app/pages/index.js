import Router from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { history } from '@app/shared'
import { WaitingPage, ErrorPage } from '@app/components/fallback'
import HomePage from './home'

const DashboardPage = lazy(() => import('./dashboard'))

export default () => (
  <Suspense fallback={<WaitingPage />}>
    <Router history={history}>
      <HomePage path="/" />
      <DashboardPage path="/dashboard/:rest*" />
      <ErrorPage default />
    </Router>
  </Suspense>
)