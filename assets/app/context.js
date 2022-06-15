import { createContext } from 'preact'
import { useContext, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { createHashHistory } from 'history'
import axios from 'axios'
import Cookies from 'js-cookie'
import localforage from 'localforage'
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
  const [state, stateSet] = useState({
    fetching: false,
    user: null,
    menu: null,
    token: null,
  })
  const history = useRef(createHashHistory())
  const isGuest = useMemo(() => !state.token, [state.token])
  const isLogin = useMemo(() => !!state.token, [state.token])
  const request = (() => {
    const req = axios.create({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      notify: true,
      anonymous: false,
    })
    req.interceptors.request.use(
      config => {
        stateUp({ fetching: true })

        if (!config.anonymous && state.token) {
          config.headers['Authorization'] = `Bearer ${state.token}`
        }

        return config
      },
    )
    req.interceptors.response.use(
      origin => {
        stateUp({ fetching: false })

        return {
          success: origin.data?.success || true,
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

        stateUp({ fetching: false })

        if (state.token && origin.response.status === 401) {
          logout(false, response.message, false, {
            title: response.title,
          })
        } else if (origin.config.notify) {
          notify(response.message, false, { title: response.title })
        }

        return Promise.resolve(response)
      },
    )

    return req
  })()
  const stateUp = (updates = {}) => stateSet(state => ({
    ...state,
    ...updates,
  }))
  const logout = async (notifyServer = true, message = null, success = true, options = {}) => {
    const withMessage = message || 'You have been logged out'

    if (notifyServer) {
      // what?
    } else {
      notify(withMessage, success, options)
    }

    await localforage.removeItem('__menu')
    Cookies.remove('__cookie')
    stateUp({ user: null, token: null, menu: null })
  }
  const login = async data => {
    const response = await request.post('/api/login', data)
    const { token } = response?.data || {}

    if (token) {
      Cookies.set('__cookie', token)
      stateUp({ token })
    }

    return response
  }
  const loadMenu = async () => {
    const { data: menu } = await request.get('/api/menu?roots=top,db')

    await localforage.setItem('__menu', menu)
    stateUp({ menu })
  }
  const initialize = async () => {
    const menu = await localforage.getItem('__menu')
    const token = Cookies.get('__cookie')

    if (token) {
      stateUp({ token, menu })
    }
  }
  const context = {
    ...state,
    app: window.app,
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
  useEffect(() => {
    state.token && !state.menu && loadMenu()
  }, [state.token, state.menu])
  useEffect(() => {
    initialize()
  }, [])

  return <AppContext.Provider value={context} children={children} />
}