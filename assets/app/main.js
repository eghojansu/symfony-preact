import { useEffect, useMemo, useState } from 'preact/hooks'
import axios from 'axios'
import { storage, AppContext } from './lib/shared'
import notify, { confirm } from './lib/notify'
import { createElement, normalizeMenu, split } from './lib/common'

export default ({ children }) => {
  const [state, stateSet] = useState({
    fetching: false,
    loading: true,
    userFetched: false,
    logged: false,
    user: null,
    menu: null,
    cache: {},
  })
  const [grants, grantsSet] = useState({})
  const isGuest = useMemo(() => !state.logged, [state.logged])
  const isLogin = useMemo(() => state.logged, [state.logged])
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
        const token = storage.getToken()

        stateUp({ fetching: true })

        if (!config.anonymous && token) {
          config.headers['Authorization'] = `Bearer ${token}`
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

        if (state.logged && origin.response?.status === 401) {
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
  const setCache = cache => stateSet(state => ({
    ...state,
    cache: 'function' === typeof cache ? cache(state.cache) : {
      ...state.cache,
      ...cache,
    },
  }))
  const setGrants = (paths, granting, granted) => grantsSet(grants => ({
    ...grants,
    ...Object.fromEntries(paths.map(path => [path, {
      granting,
      granted: granted && path in granted && granted[path],
    }])),
  }))
  const isGranted = async (path, raw) => {
    if (!state.logged) {
      return true
    }

    const paths = split(path)
    const alreadyGranted = paths.some(path => (path in grants) && !grants[path].granting)

    if (alreadyGranted) {
      if (raw) {
        return Object.fromEntries(
          paths.map(path => [path, path in grants && grants[path].granted])
        )
      }

      return paths.some(path => grants[path].granted)
    }

    setGrants(paths, true)

    const { data } = await request('/api/account/access', { params: { paths }})

    setGrants(paths, false, data?.granted)

    if (raw) {
      return Object.fromEntries(
        Object.entries(data?.granted || {}).map(([path, granted]) => [path, granted])
      )
    }

    return paths.some(path => data?.granted && (path in data.granted) && data.granted[path])
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

    await storage.clear()
    stateUp({ logged: false, user: null, userFetched: null, token: null, menu: null })
    grantsSet({})
  }
  const login = async data => {
    const response = await request.post('/api/login', data)
    const { token } = response?.data || {}

    if (token) {
      stateSet({ logged: true })
      storage.setToken(token)
    }

    return response
  }
  const fetchUser = async () => {
    const { data: user } = await request('/api/account/profile')

    stateUp({ user, userFetched: true })
  }
  const loadMenu = async () => {
    const { data } = await request.get('/api/account/menu')
    const menu = normalizeMenu(data) || {}

    await storage.setMenu(menu)
    stateUp({ menu })
  }
  const checkAuth = async () => {
    await request('/api/account')
  }
  const initialize = async () => {
    const token = storage.getToken()

    if (token) {
      const menu = await storage.getMenu()

      stateUp({ menu, logged: true })
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
    setCache,
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
    state.logged && (state.menu ? checkAuth() : loadMenu())
  }, [state.logged, state.menu])
  useEffect(() => {
    const removeListeners = registerEventListeners()

    initialize()

    return () => {
      removeListeners()
    }
  }, [])

  return <AppContext.Provider value={context} children={children} />
}