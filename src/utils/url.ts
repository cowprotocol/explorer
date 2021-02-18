export function buildSearchString(params: Record<string, string | undefined>): string {
  const filteredParams = Object.keys(params).reduce((acc, key) => {
    // Pick keys that have values non-falsy
    if (params[key]) {
      acc[key] = encodeURIComponent(params[key] as string)
    }
    return acc
  }, {})

  const searchObj = new URLSearchParams(filteredParams)

  return '?' + searchObj.toString()
}
