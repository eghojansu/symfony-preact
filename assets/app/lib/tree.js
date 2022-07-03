import { useEffect, useMemo, useState } from 'preact/hooks'
import { caseCamel, random } from './common'

export default tree

export const itemMatcher = (value, ...keys) => item => item && (
  keys.concat(['url', 'id', 'text'])
).some(key => key in item && item[key] == value)

function tree(initialize, withIdKey, extend = (tab => tab)) {
  const idKey = withIdKey || 'id'
  const [items, itemsSet] = useState([])
  const [activeId, activeIdSet] = useState()
  const activeItem = useMemo(() => items.find(itemMatcher(activeId, idKey)), [items, activeId])
  const getItem = id => items.find(itemMatcher(id, idKey))
  const addItem = (item, update, oldId, activate = true) => itemsSet(items => {
    let key = oldId || item[idKey]
    let updates = [...items]
    const existing = updates.find(itemMatcher(key, idKey))

    if (existing && update) {
      const pos = updates.indexOf(existing)

      key = existing[idKey]
      updates = [
        ...updates.slice(0, pos),
        { ...existing, ...item, [idKey]: existing[idKey] },
        ...updates.slice(pos + 1),
      ]
    } else if (!existing || item.multiple) {
      updates = [...updates, item]
    }

    activate && activeIdSet(key)

    return updates
  })
  const update = (id, item, activate = false) => addItem(item, true, id, activate)
  const add = (text, close, withTag, tab = {}, update) => {
    const id = tab.id || caseCamel(text)
    const tag = withTag || caseCamel(text)
    const key = 'text' === idKey ? text : (
      'id' === idKey ? id : ((tab && tab[idKey]) || random())
    )

    addItem(
      extend({
        ...tab,
        id,
        tag,
        text,
        idKey,
        attrs: {
          title: text,
          ...(tab.attrs || {}),
        },
        setData: (data, replace) => setData(key, data, replace),
        ...(close ? { closable: true, close: () => removeItem(key) } : {}),
      }),
      update,
    )
  }
  const removeItem = id => itemsSet(items => {
    const pos = items.findIndex(itemMatcher(id, idKey))
    const newItems = [...items.slice(0, pos), ...items.slice(pos + 1)]
    const nextActive = (newItems[pos] || newItems[0])

    if (nextActive && idKey in nextActive) {
      activeIdSet(nextActive[idKey])
    }

    return newItems
  })
  const setData = (id, data, replace) => itemsSet(items => {
    const pos = items.findIndex(itemMatcher(id, idKey))

    if (pos < 0) {
      return items
    }

    const item = items[pos]

    item.data = replace ? data : {
      ...(item.data || {}),
      ...(data || {}),
    }

    return [
      ...items.slice(0, pos),
      item,
      ...items.slice(pos + 1),
    ]
  })
  const reset = (newItems = []) => {
    itemsSet(newItems)
    activeIdSet(newItems ? newItems[0][idKey] : '')
  }
  const handleTabClose = ({ item }) => removeItem(item[idKey])
  const handleTabSelect = ({ item }) => activeIdSet(item[idKey])
  const tree = {
    items,
    activeId,
    activeItem,
    add,
    reset,
    update,
    addItem,
    getItem,
    removeItem,
    setActive: activeIdSet,
    setData,
    handleTabClose,
    handleTabSelect,
  }

  useEffect(() => {
    initialize && initialize(tree)
  }, [])

  return tree
}