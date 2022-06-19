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
  const addItem = item => {
    const add = item.multiple || !items.some(itemMatcher(item[activeKey]))

    if (add) {
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

  return {
    items,
    activeId,
    activeItem,
    addItem,
    removeItem,
    setActive: activeIdSet,
  }
}