import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

export function useSearchSubmit(): (query: string) => void {
  const history = useHistory()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      query && query.length > 0 && history.push(`/orders/${query}`)
    },
    [history],
  )
}
