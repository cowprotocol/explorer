import { useCallback } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'

export function useSearchSubmit(): (query: string) => void {
  const history = useHistory()
  const { path } = useRouteMatch()

  return useCallback(
    (query: string) => {
      const pathPrefix = path.endsWith('/') ? path : path + '/'

      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      query && query.length > 0 && history.push(`${pathPrefix}orders/${query}`)
    },
    [history, path],
  )
}
