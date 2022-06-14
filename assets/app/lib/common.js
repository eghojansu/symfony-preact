export const clsa = val => val ? (Array.isArray(val) ? val : [val]) : []
export const clsr = (...args) => args.reduce((args, val) => {
  if (!val) {
    return args
  }

  if ('object' === typeof val) {
    return [
      ...args, ...(
        Array.isArray(val) ? val : Object.entries(val).map(([key, val]) => val ? key : null)
      ).map(val => clsr(val)).reduce((args, val) => [...args, ...clsa(val)]),
    ]
  }

  return [...args, ...val.split(' ')]
}, []).filter((val, i, all) => i === all.indexOf(val))
export const clsx = (...args) => clsr(...args).join(' ') || null
export const caseJoin = (str, join = '', lowerFirst = false) => str.replace(
  /(?:^\w|[A-Z]|\b\w)/g,
  (c, i) => i === 0 && lowerFirst ? c.toLowerCase() : c.toUpperCase(),
).replace(/\W+/g, join)
export const caseTitle = str => caseJoin(str, ' ')
export const caseCamel = str => caseJoin(str, '', true)
export const caseKebab = str => caseJoin(str, '-').toLowerCase()
export const caseSnake = str => caseJoin(str, '_').toLowerCase()