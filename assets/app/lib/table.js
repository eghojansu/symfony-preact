import { useState, useRef, useEffect, useMemo } from 'preact/hooks'
import { useAppContext } from '../context'
import { clsr, split } from '../lib/common'

export default useTable

export const useAction = (access, init, checks, extras, withRowAction) => {
  const { isGranted } = useAppContext()
  const accRef = useRef({
    loading: null,
    loaded: true,
  })
  const prefix = access && 'string' === typeof access ? access : ''
  const all = [].concat(
    [[`${prefix}create`, 'create', 'C'], [`${prefix}view`, 'view', 'R'], [`${prefix}update`, 'update', 'U'], [`${prefix}delete`, 'delete', 'D']],
    [['restore', 'restore', 'O'], ['destroy', 'destroy', 'E']],
    split(checks).map(check => [`${prefix}${check}`, check, false]),
    split(extras).map(check => [check, check, false]),
  )
  const [action, actionSet] = useState({
    ...Object.fromEntries(all.map(([, action, initial]) => [action, initial && init && init.includes(initial)])),
  })
  const rowAction = useMemo(() => withRowAction ? clsr(
    ...all.map(([, name, initial]) => action[name] && initial),
  ).join('') : null, [action, withRowAction])
  const checkGrants = async () => {
    const granted = await isGranted(
      all.map(([action]) => action).join(','),
      true,
    )

    accRef.current.loaded && actionSet(action => ({ ...action, ...Object.fromEntries(
      all.map(([access, action]) => [action, granted && access in granted && granted[access]])
    ) }))
  }
  const withAction = (name, value, arraize, fallback) => action && action[name] ? (
    arraize ? [value] : value
  ) : (arraize && !fallback ? [] : fallback)

  useEffect(() => {
    (access || checks || extras) && checkGrants()

    return () => {
      accRef.current.loaded = false
    }
  }, [])

  return {
    action,
    rowAction,
    withAction,
    setAction: actionSet,
  }
}

function useTable(setup) {
  const {
    columns = [],
    source,
    access,
    checks,
    extraChecks,
    rowAction: initRowAction,
    onRowAction: doRowAction,
    formatPage = pagination => init => ({ ...init, ...pagination }),
    ...tableProps
  } = setup || {}
  const { request } = useAppContext()
  const tabRef = useRef({
    loading: null,
    pageSize: null,
    cancel: new AbortController(),
    loaded: true,
  })
  const action = useAction(access, initRowAction, checks, extraChecks, true)
  const [params, paramsSet] = useState({})
  const [loading, loadingSet] = useState(false)
  const [pagination, paginationSet] = useState({
    items: [],
    page: 0,
    size: 0,
    next: 0,
    prev: 0,
    total: 0,
    pages: 0,
  })
  const rowUrl = (row, keys) => `${source}/${keys.map(key => row[key]).join('/')}`
  const onRowAction = args => (
    doRowAction && doRowAction({ ...args, url: rowUrl(args.row, args.keys) })
  )
  const cancel = () => tabRef.current.cancel.abort()
  const load = () => {
    if (tabRef.current.loading || !source) {
      return
    }

    tabRef.current.loading = setTimeout(async () => {
      if (!tabRef.current.loaded) {
        return
      }

      loadingSet(true)

      const { data } = await request(source, {
        params,
        signal: tabRef.current.cancel.signal,
      })

      paginationSet(formatPage(data))
      loadingSet(false)

      if (!tabRef.current.pageSize) {
        tabRef.current.pageSize = data?.size
      }

      tabRef.current.loading = null
    }, 750)
  }

  useEffect(() => {
    tabRef.current.loading || load()
  }, [params])
  useEffect(() => () => {
    cancel()

    tabRef.current.loaded = false
  }, [])

  return {
    source,
    columns,
    params,
    pagination,
    loading,
    load,
    cancel,
    onRowAction,
    setParams: paramsSet,
    pageSize: tabRef.current.pageSize,
    ...action,
    ...tableProps,
  }
}