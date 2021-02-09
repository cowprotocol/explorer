import { useEffect, useState } from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Network } from 'types'

import { buildErc20Key, saveSingleErc20 } from 'reducers-actions/erc20'

import useGlobalState from 'hooks/useGlobalState'

import { getErc20Info } from 'services/helpers'

import { web3, erc20Api } from 'apps/explorer/api'

import { ExplorerAppState } from 'apps/explorer/state'

type Params = {
  address?: string
  networkId?: Network
}

type Return = { isLoading: boolean; error?: string; value?: TokenErc20 }

export function useErc20(params: Params): Return {
  const { address, networkId } = params

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [{ erc20s }, dispatch] = useGlobalState<ExplorerAppState>()

  // Initial state from global state
  const [erc20, setErc20] = useState<TokenErc20 | undefined>(
    address && networkId ? erc20s.get(buildErc20Key(networkId, address)) : undefined,
  )

  useEffect(() => {
    // Only try to fetch it if not on global state
    if (!erc20 && address && networkId) {
      setIsLoading(true)
      setError('')

      getErc20Info({ tokenAddress: address, networkId, web3, erc20Api })
        .then((fetchedErc20) => {
          // When not found, it returns null
          if (fetchedErc20) {
            dispatch(saveSingleErc20(fetchedErc20, networkId))
            setErc20(fetchedErc20)
          }
        })
        .catch((e) => {
          // Set error only when the call fails
          // Not finding the token is not an error
          const msg = `Failed to fetch erc20 details for ${address} on network ${networkId}`
          console.error(msg, e)
          setError(msg)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [address, dispatch, erc20, networkId])

  return { isLoading, error, value: erc20 }
}
