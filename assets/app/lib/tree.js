import { useMemo, useState } from 'preact/hooks'

export const itemMatcher = check => item => (
  (item?.url && item.url === check)
  || (item?.id && item.id === check)
  || (item?.text && item.text === check)
)

export default (initialItems, initialActive, activeKey = 'text') => {
  const [items, itemsSet] = useState(initialItems || [])
  const [activeId, activeIdSet] = useState(initialActive)
  const activeItem = useMemo(() => items.find(itemMatcher(activeId)), [items, activeId])
  const addItem = (item, update) => {
    const existing = items.find(itemMatcher(item[activeKey]))

    if (existing && update) {
      const pos = items.indexOf(existing)

      itemsSet([
        ...items.slice(0, pos),
        { ...existing, ...item, [activeKey]: existing[activeKey] },
        ...items.slice(pos + 1),
      ])
    } else if (!existing || item.multiple) {
      itemsSet(items => [...items, item])
    }

    activeIdSet(item[activeKey])
  }
  const removeItem = id => itemsSet(items => {
    const pos = items.findIndex(itemMatcher(id))
    const newItems = [...items.slice(0, pos), ...items.slice(pos + 1)]
    const nextActive = (newItems[pos] || newItems[0])

    if (nextActive && activeKey in nextActive) {
      activeIdSet(nextActive[activeKey])
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

  return {
    items,
    activeId,
    activeItem,
    addItem,
    removeItem,
    setActive: activeIdSet,
    setData,
  }
}