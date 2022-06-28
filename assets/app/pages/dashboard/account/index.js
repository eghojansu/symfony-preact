import Router from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { pathPrefix } from '@app/lib/common'
import { WaitingPage, ErrorPage } from '@app/components/fallback'
import Panel from '@app/components/panel'
import HomePage from './home'

export default MainPage

const PasswordPage = lazy(() => import('./password'))
const ActivitiesPage = lazy(() => import('./activities'))

function MainPage ({ path, url }) {
  const prefix = pathPrefix(path)
  const items = [
    {
      url: prefix,
      text: 'Profile',
    },
    {
      url: `${prefix}/password`,
      text: 'Password',
    },
    {
      url: `${prefix}/activities`,
      text: 'Activities',
    },
  ]

  return (
    <Panel title="Account" activeId={url} items={items}>
      <Suspense loading={<WaitingPage />}>
        <Router>
          <HomePage path={prefix} />
          <PasswordPage path={`${prefix}/password`} />
          <ActivitiesPage path={`${prefix}/activities`} />
          <ErrorPage default />
        </Router>
      </Suspense>
    </Panel>
  )
}