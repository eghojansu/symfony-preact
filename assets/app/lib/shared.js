import { createContext } from 'preact'
import { createHashHistory } from 'history'
import Cookies from 'js-cookie'
import localforage from 'localforage'

export const AppContext = createContext()
export const history = createHashHistory()
export const storage = (() => {
  const tokenName = '__token'
  const menuName = '__menu'

  const storage = {
    getToken: () => Cookies.get(tokenName),
    setToken: token => Cookies.set(tokenName, token),
    remToken: () => Cookies.remove(tokenName),
    getMenu: async () => await localforage.getItem(menuName),
    setMenu: async menu => await localforage.setItem(menuName, menu),
    remMenu: async () => await localforage.removeItem(menuName),
    clear: async () => {
      storage.remToken()
      await storage.remMenu()
    },
  }

  return storage
})()