import { useMemo, useState } from 'preact/hooks'

export default tree

export const itemMatcher = check => item => (
  (item?.url && item.url === check)
  || (item?.id && item.id === check)
  || (item?.text && item.text === check)
)

function tree(initialItems, initialActive, idKey = 'text') {
  const [items, itemsSet] = useState(initialItems || [])
  const [activeId, activeIdSet] = useState(initialActive || (initialItems ? initialItems[0][idKey] : ''))
  const activeItem = useMemo(() => items.find(itemMatcher(activeId)), [items, activeId])
  const addItem = (item, update) => {
    const existing = items.find(itemMatcher(item[idKey]))

    if (existing && update) {
      const pos = items.indexOf(existing)

      itemsSet([
        ...items.slice(0, pos),
        { ...existing, ...item, [idKey]: existing[idKey] },
        ...items.slice(pos + 1),
      ])
    } else if (!existing || item.multiple) {
      itemsSet(items => [...items, item])
    }

    activeIdSet(item[idKey])
  }
  const removeItem = id => itemsSet(items => {
    const pos = items.findIndex(itemMatcher(id))
    const newItems = [...items.slice(0, pos), ...items.slice(pos + 1)]
    const nextActive = (newItems[pos] || newItems[0])

    if (nextActive && idKey in nextActive) {
      activeIdSet(nextActive[idKey])
    }

    return newItems
  })
  const setData = (id, data, replace) => itemsSet(items => {
    const pos = items.findIndex(itemMatcher(id))

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

  return {
    items,
    activeId,
    activeItem,
    reset,
    addItem,
    removeItem,
    setActive: activeIdSet,
    setData,
    handleTabClose,
    handleTabSelect,
  }
}