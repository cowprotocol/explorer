import { useCallback } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { sanitizeInput } from 'utils'

export function useSearchSubmit(): (query: string) => void {
  const history = useHistory()
  const { path } = useRouteMatch()

  return useCallback(
    (query: string) => {
      const pathPrefix = path == '/' ? '' : path
      const cleanQuery = sanitizeInput(query)

      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      cleanQuery && cleanQuery.length > 0 && history.push(`${pathPrefix}/orders/${cleanQuery}`)
    },
    [history, path],
  )
}
