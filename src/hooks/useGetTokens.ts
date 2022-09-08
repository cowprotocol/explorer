import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { subDays, subHours } from 'date-fns'
import { Network, UiError } from 'types'
import { COW_SDK, NATIVE_TOKEN_PER_NETWORK } from 'const'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { UTCTimestamp } from 'lightweight-charts'
import { getPercentageDifference, isNativeToken } from 'utils'

export function useGetTokens(networkId: Network | undefined, tableState: TableState): GetTokensResult {
  const [isLoading, setIsLoading] = useState(false)
  const [historicalDataLoaded, setHistoricalDataLoaded] = useState<{ [pageIndex: string]: boolean }>({})
  const [error, setError] = useState<UiError>()
  const [tokens, setTokens] = useState<Token[]>([])

  const fetchTokens = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      setTokens([])
      setHistoricalDataLoaded({})
      try {
        const response = await COW_SDK.cowSubgraphApi.runQuery<{ tokens: TokenResponse[] }>(
          GET_TOKENS_QUERY,
          undefined,
          { chainId: network },
        )
        if (response) {
          const tokens = enhanceNativeToken(response.tokens, network)
          setTokens(tokens)
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

  const getTokens = useCallback(
    (tokenIds: string[]): { [tokenId: string]: Promise<SubgraphHistoricalDataResponse> | undefined } => {
      const lastDayTimestamp = Number(lastHoursTimestamp(25)) // last 25 hours
      const lastWeekTimestamp = Number(lastDaysTimestamp(8)) // last 8 days
      const responses = {}
      for (const tokenId of tokenIds) {
        const response = COW_SDK.cowSubgraphApi.runQuery<SubgraphHistoricalDataResponse>(
          GET_HISTORICAL_DATA_QUERY,
          {
            address: tokenId,
            lastDayTimestamp,
            lastWeekTimestamp,
          },
          { chainId: networkId },
        )
        responses[tokenId] = response
      }

      return responses
    },
    [networkId],
  )

  const processTokenData = useCallback((data: SubgraphHistoricalDataResponse) => {
    const lastDayUsdVolume = data.tokenHourlyTotals.reduce((acc, curr) => acc + Number(curr.totalVolumeUsd), 0)
    const priceUsd = data.tokenHourlyTotals[0]?.averagePrice

    const lastDayTimestampFrom = Number(lastHoursTimestamp(25))
    const lastDayTimestampTo = Number(lastHoursTimestamp(23))
    const lastWeekTimestampFrom = Number(lastDaysTimestamp(8))
    const lastWeekTimestampTo = Number(lastDaysTimestamp(6))
    const lastDayPrice = data.tokenHourlyTotals.find(
      (x) => x.timestamp >= lastDayTimestampFrom && x.timestamp <= lastDayTimestampTo,
    )?.averagePrice
    const lastWeekPrice = data.tokenHourlyTotals.find(
      (x) => x.timestamp >= lastWeekTimestampFrom && x.timestamp <= lastWeekTimestampTo,
    )?.averagePrice

    return {
      lastDayUsdVolume,
      lastDayPricePercentageDifference: lastDayPrice
        ? getPercentageDifference(Number(priceUsd), Number(lastDayPrice))
        : undefined,
      lastWeekPricePercentageDifference: lastWeekPrice
        ? getPercentageDifference(Number(priceUsd), Number(lastWeekPrice))
        : undefined,
      lastWeekUsdPrices: data.tokenHourlyTotals
        .map((x) => ({
          time: Number(x.timestamp) as UTCTimestamp,
          value: Number(x.averagePrice),
        }))
        .sort((a, b) => a.time - b.time),
    }
  }, [])

  const getTokensHistoricalData = useCallback(
    async (tokenIds: string[]): Promise<{ [tokenId: string]: TokenData } | void> => {
      setIsLoading(true)
      try {
        const tokens = await getTokens(tokenIds)
        const tokensData = {} as { [tokenId: string]: TokenData }

        for (const address of Object.keys(tokens)) {
          const response = await tokens[address]
          if (!response) {
            continue
          }

          const tokenData = processTokenData(response)
          tokensData[address] = { ...tokenData }
        }

        return tokensData
      } catch (e) {
        const msg = `Failed to fetch tokens' data`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [getTokens, processTokenData],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchTokens(networkId)
  }, [fetchTokens, networkId])

  useEffect(() => {
    if (tokens.length === 0 || !networkId || !tableState.pageIndex || historicalDataLoaded[tableState.pageIndex]) {
      return
    }

    const pageTokens = tokens.slice(
      (tableState.pageIndex - 1) * tableState.pageSize,
      tableState.pageIndex * tableState.pageSize,
    )
    const tokenIds = pageTokens.map((token) => token.id)

    const setHistoricalData = async function (): Promise<void> {
      const historicalData = await getTokensHistoricalData(tokenIds)

      if (historicalData) {
        setTokens((tokens) => [...addHistoricalData(tokens, historicalData)])
        setHistoricalDataLoaded((loaded) => ({ ...loaded, [tableState.pageIndex || 0]: true }))
      }
    }

    setHistoricalData()
  }, [tableState.pageIndex, tableState.pageSize, tokens, networkId, getTokensHistoricalData, historicalDataLoaded])

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

export const GET_HISTORICAL_DATA_QUERY = gql`
  query GetHistoricalData($address: ID!, $lastDayTimestamp: Int!, $lastWeekTimestamp: Int!) {
    tokenHourlyTotals(
      first: 25
      orderBy: timestamp
      orderDirection: desc
      where: { token: $address, timestamp_gt: $lastDayTimestamp }
    ) {
      token {
        address
      }
      timestamp
      totalVolumeUsd
      averagePrice
    }

    tokenDailyTotals(
      first: 8
      orderBy: timestamp
      orderDirection: desc
      where: { token: $address, timestamp_gt: $lastWeekTimestamp }
    ) {
      token {
        address
      }
      timestamp
      averagePrice
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

export type TokenDailyTotals = {
  token: { address: string }
  timestamp: number
  totalVolumeUsd: string
  averagePrice: string
}

export type TokenWeeklyTotals = {
  token: { address: string }
  timestamp: number
  averagePrice: string
}

export type SubgraphHistoricalDataResponse = {
  tokenHourlyTotals: Array<TokenDailyTotals>
  tokenDailyTotals: Array<TokenWeeklyTotals>
}

export type Token = {
  lastDayPricePercentageDifference?: number | null
  lastWeekPricePercentageDifference?: number | null
  lastDayUsdVolume?: number | null
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }> | null
} & TokenResponse &
  TokenErc20

function addHistoricalData(tokens: Token[], prices: { [tokenId: string]: TokenData }): Token[] {
  for (const address of Object.keys(prices)) {
    const token = tokens.find((token) => token.address === address)
    const values = prices[address]

    if (token) {
      token.lastDayUsdVolume = values.lastDayUsdVolume
      token.lastDayPricePercentageDifference = values.lastDayPricePercentageDifference
      token.lastWeekPricePercentageDifference = values.lastWeekPricePercentageDifference
      token.lastWeekUsdPrices = values.lastWeekUsdPrices
    }
  }
  return tokens
}

export type TokenData = {
  lastDayUsdVolume?: number
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
}

function lastHoursTimestamp(n: number): string {
  return (subHours(new Date(), n).getTime() / 1000).toFixed(0)
}

function lastDaysTimestamp(n: number): string {
  return (subDays(new Date(), n).getTime() / 1000).toFixed(0)
}

function enhanceNativeToken(tokens: TokenResponse[], network: Network): TokenResponse[] {
  return tokens.map((token) => {
    if (!isNativeToken(token.address)) {
      return token
    }
    console.log(NATIVE_TOKEN_PER_NETWORK[network], token)
    return {
      ...token,
      ...NATIVE_TOKEN_PER_NETWORK[network],
    }
  })
}
