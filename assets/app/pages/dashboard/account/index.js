import Router from 'preact-router'
import { Suspense, lazy } from 'preact/compat'
import { pathPrefix } from '@app/lib/common'
import { WaitingPage, ErrorPage } from '@app/components/fallback'
import Panel from '@app/components/panel'
import HomePage from './home'

const PasswordPage = lazy(() => import('./password'))

export default ({ path, url }) => {
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
  ]

  return (
    <Panel title="Account" activeId={url} items={items}>
      <Suspense loading={<WaitingPage />}>
        <Router>
          <HomePage path={prefix} />
          <PasswordPage path={`${prefix}/password`} />
          <ErrorPage default />
        </Router>
      </Suspense>
    </Panel>
  )
}