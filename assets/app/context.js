import { createContext } from 'preact'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'
import axios from 'axios'
import Cookies from 'js-cookie'
import localforage from 'localforage'
import FormLogin from './components/form-login'
import { Loading, LoadingPage, ErrorPage } from './components/fallback'
import notify, { confirm } from './lib/notify'
import { createElement, normalizeMenu } from './lib/common'

export default AppProvider

const AppContext = createContext()

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

function AppProvider({ children }) {
  const [state, stateSet] = useState({
    fetching: false,
    loading: true,
    userFetched: false,
    user: null,
    menu: null,
    token: null,
  })
  const [grants, grantsSet] = useState({})
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
    const collectData = data => 'data' in data ? data.data : (
      ('message' in data) || ('detail' in data) || ('errors' in data) ? null : data
    )
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
        const data = 'object' === typeof origin?.data ? origin.data : {}

        stateUp({ fetching: false })

        return {
          success: 'success' in data ? data.success : true,
          title: data.title || origin?.statusText,
          message: data.detail || data.message || 'Request successful',
          data: collectData(data),
          errors: data.errors || null,
          origin,
        }
      },
      origin => {
        const data = 'object' === typeof origin.response?.data ? origin.response.data : {}
        const response = {
          success: false,
          title: data.title || origin.response?.statusText,
          message: data.detail || data.message || 'Unknown error',
          data: collectData(data),
          errors: data.errors || null,
          origin,
        }

        stateUp({ fetching: false })

        if (state.token && origin.response?.status === 401) {
          logout(false, response.message, false, {
            title: response.title,
          })
        } else if (origin.config?.notify) {
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
  const isGranted = async path => {
    if (!state.token) {
      return true
    }

    if (path in grants && !grants[path].granting) {
      return grants[path].granted
    }

    grantsSet(grants => ({ ...grants, [path] : { granting: true }}))

    const { data } = await request('/api/account/access', { params: { path }})

    grantsSet(grants => ({ ...grants, [path] : { granting: false, granted: data?.granted }}))
  }
  const logout = async (notifyServer = true, message = null, success = true, options = {}) => {
    let doNotify = true
    let withMessage = message || 'You have been logged out'

    if (notifyServer) {
      const { isConfirmed, value: { success, message } = {} } = await confirm(
        () => request.post('/api/account/logout'),
      )

      if (!isConfirmed) {
        return
      }

      if (message) {
        withMessage = message
      }

      doNotify = success
    }

    if (doNotify) {
      notify(withMessage, success, options)
    }

    await localforage.removeItem('__menu')
    Cookies.remove('__token')
    stateUp({ user: null, userFetched: null, token: null, menu: null })
    grantsSet({})
  }
  const login = async data => {
    const response = await request.post('/api/login', data)
    const { token } = response?.data || {}

    if (token) {
      Cookies.set('__token', token)
      stateUp({ token })
    }

    return response
  }
  const fetchUser = async () => {
    const { data: user } = await request('/api/account/profile')

    stateUp({ user, userFetched: true })
  }
  const loadMenu = async () => {
    const { data } = await request.get('/api/account/menu?roots=top,db')
    const menu = normalizeMenu(data)

    await localforage.setItem('__menu', menu)
    stateUp({ menu })
  }
  const checkAuth = async () => {
    await request('/api/account')
  }
  const initialize = async () => {
    const menu = await localforage.getItem('__menu')
    const token = Cookies.get('__token')

    if (token) {
      stateUp({ token, menu })
    }

    stateUp({ loading: false })
  }
  const registerEventListeners = () => {
    const clickHandlers = [
      ['[data-action=logout]', () => logout(), true],
      ['.offcanvas a', event => {
        const href = event.target.getAttribute('href')

        if (href.startsWith('#')) {
          return
        }

        const offElement = event.target.closest('.offcanvas')
        const offInstance = bootstrap.Offcanvas.getInstance(offElement)

        offInstance.hide()
      }],
    ]
    const handleClick = event => {
      const doPrevent = () => {
        event.preventDefault()
        event.stopPropagation()
      }
      clickHandlers.forEach(([selector, handle, prevent = false]) => {
        if (event.target.matches(selector) || event.target.closest(selector)) {
          prevent && doPrevent()
          handle(event, doPrevent)
        }
      })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }
  const context = {
    ...state,
    app: window.app,
    isGuest,
    isLogin,
    request,
    grants,
    login,
    logout,
    fetchUser,
    isGranted,
    loadMenu,
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
    state.token && (
      state.menu ? checkAuth() : loadMenu()
    )
  }, [state.token, state.menu])
  useEffect(() => {
    const removeListeners = registerEventListeners()

    initialize()

    return () => {
      removeListeners()
    }
  }, [])

  return <AppContext.Provider value={context} children={children} />
}