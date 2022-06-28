import { useState, useRef, useEffect } from 'preact/hooks'
import { useAppContext } from '../context'

export default useTable

function useTable(setup) {
  const {
    columns = [],
    source,
    onAction: doAction,
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
  const onAction = args => {
    const { keys, row } = args
    const url = rowUrl(row, keys)

    doAction && doAction({ ...args, url })
  }
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
    onAction,
    setParams: paramsSet,
    pageSize: tabRef.current.pageSize,
    ...tableProps,
  }
}