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
  const maps = {
    actions: [[`${access}create`, 'create', 'C'], [`${access}view`, 'view', 'R'], [`${access}update`, 'update', 'U'], [`${access}delete`, 'delete', 'D']],
    actionsRaw: [['restore', 'restore', 'O'], ['destroy', 'destroy', 'E']],
    checks: split(checks).map(check => [`${access}${check}`, check]),
    extras: split(extras).map(check => [check, check]),
  }
  const [action, actionSet] = useState({
    ...Object.fromEntries(maps.actions.concat(maps.actionsRaw).map(([, action, initial]) => [action, init && init.includes(initial)])),
    ...Object.fromEntries(maps.checks.concat(maps.extras).map(([granted]) => [granted, false])),
  })
  const rowAction = useMemo(() => withRowAction ? clsr(
    ...maps.actions.concat(maps.actionsRaw).map(([, name, initial]) => action[name] && initial),
  ).join('') : null, [action, withRowAction])
  const checkGrants = async () => {
    const granted = await isGranted(
      [].concat(
        maps.actions,
        maps.actionsRaw,
        maps.checks,
        maps.extras,
      ).map(([action]) => action).join(','),
      true,
    )

    accRef.current.loaded && actionSet(action => ({ ...action, ...Object.fromEntries(
      [].concat(
        maps.actions,
        maps.actionsRaw,
        maps.checks,
        maps.extras,
      ).map(([access, action]) => [action, granted && access in granted && granted[access]])
    ) }))
  }
  const withAction = (name, value, arraize, fallback) => action && action[name] ? (
    arraize ? [value] : value
  ) : (arraize && !fallback ? [] : fallback)

  useEffect(() => {
    (access || extras) &&  checkGrants()

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