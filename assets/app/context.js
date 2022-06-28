import { useEffect, useContext } from 'preact/hooks'
import FormLogin from './components/form-login'
import { Loading, LoadingPage, ErrorPage } from './components/fallback'
import { AppContext } from './lib/shared'

export const useAppContext = () => {
  const ctx = useContext(AppContext)

  if (!ctx) {
    throw new Error('Not in app context')
  }

  return ctx
}

export const withContext = Component => props => {
  const ctx = useAppContext()

  if (ctx.loading) {
    return null
  }

  return <Component ctx={ctx} {...props} />
}

export const withUser = (Component, load) => withContext(
  props => {
    const { ctx: { app, login, userFetched, fetchUser, isLogin, isGuest } } = props

    useEffect(() => {
      load && isLogin && !userFetched && fetchUser()
    }, [userFetched])

    if (isGuest) {
      return <FormLogin app={app} onSubmit={login} />
    }

    if (load && !userFetched) {
      return <Loading />
    }

    return <Component {...props} />
  },
)

export const withGranted = (Component, path = true, load = false) => withUser(
  props => {
    const { ctx: { isGranted, grants }, path: currentPath } = props
    const granted = 'string' === typeof path ? path : currentPath

    useEffect(() => {
      granted && isGranted(granted)
    }, [])

    if (granted in grants) {
      if (grants[granted].granting) {
        return (
          <LoadingPage
            title="Stand by"
            icon="hourglass"
            message="Checking your access..." />
        )
      }

      if (!grants[granted].granted) {
        return (
          <ErrorPage
            title="Access Denied"
            icon="shield-exclamation"
            message="You have no right to access this page" />
        )
      }
    }

    return <Component {...props} />
  },
  load,
)
