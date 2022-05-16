import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { subHours } from 'date-fns'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TokenErc20 } from '@gnosis.pm/dex-js'

export function useGetTokens(networkId: Network | undefined, tableState: TableState): GetTokensResult {
  const [isLoading, setIsLoading] = useState(false)
  const [volumeLoaded, setVolumeLoaded] = useState<{ [pageIndex: string]: boolean }>({})
  const [error, setError] = useState<UiError>()
  const [tokens, setTokens] = useState<Token[]>([])

  const fetchTokens = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      try {
        const response = await COW_SDK[network]?.cowSubgraphApi.runQuery<{ tokens: TokenResponse[] }>(
          GET_TOKENS_QUERY as any,
        )
        if (response) {
          setTokens(response.tokens)
        }
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

  const setTokensVolume = useCallback(
    async (network: Network, pageIndex: number, tokenIds: string[]): Promise<void> => {
      setIsLoading(true)
      try {
        const fromTimestamp = (subHours(new Date(), 25).getTime() / 1000).toFixed(0) // last 25 hours
        const responses = {} as { [tokenId: string]: Promise<HistoricalDataResponse> | undefined }
        for (const tokenId of tokenIds) {
          const response = COW_SDK[network]?.cowSubgraphApi.runQuery<HistoricalDataResponse>(
            GET_TOKEN_LAST_DAY_VOLUME_QUERY as any,
            { address: tokenId, fromTimestamp },
          )
          responses[tokenId] = response
        }

        const tokenVolume = {} as { [tokenId: string]: number }

        for (const address of Object.keys(responses)) {
          const response = await responses[address]
          if (!response) {
            continue
          }
          const volume = response.tokenHourlyTotals.reduce((acc, curr) => acc + Number(curr.totalVolumeUsd), 0)

          tokenVolume[address] = volume
        }

        setTokens((tokens) => [...addHistoricalData(tokens, tokenVolume)])
        setVolumeLoaded((volumeLoaded) => ({ ...volumeLoaded, [pageIndex]: true }))
      } catch (e) {
        const msg = `Failed to fetch tokens' data`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [setTokens, setVolumeLoaded],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchTokens(networkId)
  }, [fetchTokens, networkId])

  useEffect(() => {
    if (tokens.length === 0 || !networkId || !tableState.pageIndex || volumeLoaded[tableState.pageIndex]) {
      return
    }

    const pageTokens = tokens.slice(
      (tableState.pageIndex - 1) * tableState.pageSize,
      tableState.pageIndex * tableState.pageSize,
    )
    const tokenIds = pageTokens.map((token) => token.id)

    setTokensVolume(networkId, tableState.pageIndex || 0, tokenIds)
  }, [tableState.pageIndex, tableState.pageSize, tokens, networkId, setTokensVolume, volumeLoaded])

  return { tokens, error, isLoading }
}

type GetTokensResult = {
  tokens: Token[]
  error?: UiError
  isLoading: boolean
}

export const GET_TOKENS_QUERY = gql`
  query GetTokens {
    tokens(first: 50, orderBy: totalVolumeUsd, orderDirection: desc, where: { totalVolumeUsd_not: null }) {
      id
      address
      name
      symbol
      decimals
      totalVolumeUsd
      priceUsd
    }
  }
`

export const GET_TOKEN_LAST_DAY_VOLUME_QUERY = gql`
  query GetTokenLastDayVolume($address: ID!, $fromTimestamp: String!) {
    tokenHourlyTotals(
      first: 24
      orderBy: timestamp
      orderDirection: desc
      where: { token: $address, timestamp_gt: $fromTimestamp }
    ) {
      token {
        address
      }
      totalVolumeUsd
    }
  }
`

export type TokenResponse = {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  priceUsd: string
  totalVolumeUsd: string
}

export type TokenTotals = {
  token: { address: string }
  timestamp: string
  totalVolumeUsd: string
}

export type HistoricalDataResponse = {
  tokenHourlyTotals: Array<TokenTotals>
}

export type Token = {
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  lastDayUsdVolume?: number
  lastWeekUsdPrices?: Array<{ time: string; value: number }>
} & TokenResponse &
  TokenErc20

function addHistoricalData(tokens: Token[], tokenVolume: { [tokenId: string]: number }): Token[] {
  for (const address of Object.keys(tokenVolume)) {
    const token = tokens.find((token) => token.address === address)

    if (token) {
      token.lastDayUsdVolume = tokenVolume[address]
    }
  }
  return tokens
}

/*
const TOKENS = [
{
  id: 1,
  ...WRAPPED_ETHER,
  priceUsd: '2778.430212806305563534200019839624',
  lastDayPricePercentageDifference: -3.32,
  lastWeekPricePercentageDifference: -3.32,
  lastDayUsdVolume: 329302355,
   lastWeekUsdPrices: [
    { time: '2019-02-11', value: 80.01 },
    { time: '2019-07-12', value: 90.63 },
    { time: '2019-08-13', value: 76.64 },
    { time: '2019-10-14', value: 98.89 },
  ] 
},
{
  id: 2,
  ...DAI,
  priceUsd: '0.9999999999999999999999999999999999',
  lastDayPricePercentageDifference: 3.32,
  lastWeekPricePercentageDifference: 3.32,
  lastDayUsdVolume: 329302355,
  lastWeekUsdPrices: [
    { time: '2019-02-11', value: 100.01 },
    { time: '2019-07-12', value: 90.63 },
    { time: '2019-08-13', value: 76.64 },
    { time: '2019-10-14', value: 85.89 },
  ], 
},
] as Token[] */
