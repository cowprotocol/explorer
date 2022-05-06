import { useCallback, useEffect, useState } from 'react'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Token } from 'api/operator/types'
import { Network, UiError } from 'types'
import { NATIVE_TOKEN_ADDRESS } from 'const'

const DAI: TokenErc20 = {
  name: 'Dai Stablecoin',
  symbol: 'DAI',
  decimals: 18,
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
}

const WRAPPED_ETHER: TokenErc20 = {
  name: 'Wrapped Ether',
  symbol: 'ETH',
  decimals: 18,
  address: NATIVE_TOKEN_ADDRESS,
}

const TOKENS = [
  {
    id: 1,
    ...WRAPPED_ETHER,
    priceUsd: '2778.430212806305563534200019839624',
    /*
    lastDayPricePercentageDifference: -3.32,
    lastWeekPricePercentageDifference: -3.32,
    lastDayUsdVolume: 329302355,
     lastWeekUsdPrices: [
      { time: '2019-02-11', value: 80.01 },
      { time: '2019-07-12', value: 90.63 },
      { time: '2019-08-13', value: 76.64 },
      { time: '2019-10-14', value: 98.89 },
    ] 
    */
  },
  {
    id: 2,
    ...DAI,
    priceUsd: '0.9999999999999999999999999999999999',
    /* 
    lastDayPricePercentageDifference: 3.32,
    lastWeekPricePercentageDifference: 3.32,
    lastDayUsdVolume: 329302355,
    lastWeekUsdPrices: [
      { time: '2019-02-11', value: 100.01 },
      { time: '2019-07-12', value: 90.63 },
      { time: '2019-08-13', value: 76.64 },
      { time: '2019-10-14', value: 85.89 },
    ], 
    */
  },
] as Token[]

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
