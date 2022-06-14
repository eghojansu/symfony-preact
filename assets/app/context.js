import { createContext } from 'preact'
import { useContext, useMemo, useRef, useState } from 'preact/hooks'
import { createHashHistory } from 'history'
import FormLogin from './components/form-login'
import axios from 'axios'

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
    return <FormLogin app={ctx.app} onSubmit={ctx.login} />
  }

  return <Component ctx={ctx} {...props} />
}

export default ({ children }) => {
  const [app] = useState(window.app)
  const history = useRef(createHashHistory())
  const isGuest = useMemo(() => !app?.user, [app])
  const isLogin = useMemo(() => !!app?.user, [app])
  const request = (() => {
    const req = axios.create({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    req.interceptors.response.use(
      origin => ({
        success: origin.data?.success,
        title: origin.data?.title || origin.statusText,
        message: origin.data?.detail || origin.data?.message || 'OK',
        data: origin.data?.data || null,
        origin,
      }),
      origin => Promise.resolve({
        success: false,
        title: origin.response?.data?.title || origin.response.statusText,
        message: origin.response?.data?.detail || 'Unknown error',
        data: origin.response?.data?.data || null,
        origin,
      })
    )

    return req
  })()
  const login = async data => {
    const response = await request.post('/api/login', data)

    console.log(response)
  }
  const context = {
    app,
    history,
    isGuest,
    isLogin,
    request,
    login,
  }

  return <AppContext.Provider value={context} children={children} />
}