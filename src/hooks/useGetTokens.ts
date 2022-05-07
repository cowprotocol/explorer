import { useCallback, useEffect, useState } from 'react'
import { Token } from 'api/operator/types'
import { Network, UiError } from 'types'
import TOKENS from 'data/tokens'

export function useGetTokens(networkId: Network | undefined): GetTokensResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [tokens, setTokens] = useState<Token[]>([])

  const fetchTokens = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      try {
        console.log(network)
        setTokens(TOKENS)
      } catch (e) {
        const msg = `Failed to fetch tokens`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [setTokens],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchTokens(networkId)
  }, [fetchTokens, networkId])

  return { tokens, error, isLoading }
}

type GetTokensResult = {
  tokens: Token[]
  error?: UiError
  isLoading: boolean
}
