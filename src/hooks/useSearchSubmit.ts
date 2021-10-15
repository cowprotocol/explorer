import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { isAnAddressAccount } from 'utils'
import { usePathPrefix } from 'state/network'
import { web3 } from 'apps/gp-v1/api'

export function pathAccordingTo(query: string): string {
  let path = 'orders'
  if (isAnAddressAccount(query)) {
    path = 'address'
  }

  return path
}

export function useSearchSubmit(): (query: string) => void {
  const history = useHistory()
  const prefixNetwork = usePathPrefix()

  return useCallback(
    (query: string) => {
      // For now assumes /orders/ path. Needs logic to try all types for a valid response:
      // Orders, transactions, tokens, batches
      const path = pathAccordingTo(query)
      const pathPrefix = prefixNetwork ? `${prefixNetwork}/${path}` : `${path}`
      if (pathPrefix === 'address') {
        if (web3) {
          web3.eth.ens
            .getAddress(query)
            .then((res) => res && res.length > 0 && history.push(`/${pathPrefix}/${res}`))
            .catch(() => history.push(`/address/null`))
        }
      } else {
        query && query.length > 0 && history.push(`/${pathPrefix}/${query}`)
      }
    },
    [history, prefixNetwork],
  )
}
