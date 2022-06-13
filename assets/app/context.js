import { createContext } from 'preact'
import { useContext, useMemo, useRef, useState } from 'preact/hooks'
import { createHashHistory } from 'history'
import FormLogin from './components/form-login'

const AppContext = createContext()

export const useAppContext = () => {
  const ctx = useContext(AppContext)

  if (!ctx) {
    throw new Error('Not in app context')
  }

  return ctx
}

export const withContext = (Component, granted = []) => props => {
  const ctx = useAppContext()

  if (granted && ctx.isGuest) {
    return <FormLogin />
  }

  return <Component ctx={ctx} {...props} />
}

export default ({ children }) => {
  const [app] = useState(window.app)
  const history = useRef(createHashHistory())
  const isGuest = useMemo(() => !app?.user, [app])
  const isLogin = useMemo(() => !!app?.user, [app])
  const context = {
    app,
    history,
    isGuest,
    isLogin,
  }

  return <AppContext.Provider value={context} children={children} />
}