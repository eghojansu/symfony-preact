import { createContext } from 'preact'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { createHashHistory } from 'history'
import axios from 'axios'
import FormLogin from './components/form-login'
import notify from './lib/notify'
import { createElement } from './lib/common'

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
  const [state, stateSet] = useState({
    fetching: false,
  })
  const history = useRef(createHashHistory())
  const isGuest = useMemo(() => !app?.user, [app])
  const isLogin = useMemo(() => !!app?.user, [app])
  const request = (() => {
    const req = axios.create({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      notify: true,
    })
    req.interceptors.request.use(
      config => {
        stateChange('fetching', true)

        return config
      },
    )
    req.interceptors.response.use(
      origin => {
        stateChange('fetching', false)

        return {
          success: origin.data?.success,
          title: origin.data?.title || origin.statusText,
          message: origin.data?.detail || origin.data?.message || 'OK',
          data: origin.data?.data || null,
          origin,
        }
      },
      origin => {
        const response = {
          success: false,
          title: origin.response?.data?.title || origin.response.statusText,
          message: origin.response?.data?.detail || origin.response?.data?.message || 'Unknown error',
          data: origin.response?.data?.data || null,
          origin,
        }

        stateChange('fetching', false)

        if (origin.config.notify) {
          notify(response.message, false, { title: response.title })
        }

        return Promise.resolve(response)
      },
    )

    return req
  })()
  const stateChange = (name, value) => stateSet(state => ({
    ...state,
    [name]:
    'function' === typeof value ? value(state[name]) : value,
  }))
  const login = async data => {
    const response = await request.post('/api/login', data)

    return response
  }
  const context = {
    app,
    history,
    isGuest,
    isLogin,
    request,
    login,
  }

  useEffect(() => {
    let pb = document.getElementById('top-state')

    if (!pb) {
      pb = createElement(
        'div',
        { class: 'top-state d-none', id: 'top-state' },
        createElement('div', { class: 'top-state-value' }),
      )

      document.body.appendChild(pb)
    }

    if (state.fetching) {
      pb.classList.remove('d-none')
    } else {
      pb.classList.add('d-none')
    }
  }, [state.fetching])

  return <AppContext.Provider value={context} children={children} />
}