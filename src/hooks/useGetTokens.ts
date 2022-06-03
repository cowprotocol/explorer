import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { subDays, subHours } from 'date-fns'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { UTCTimestamp } from 'lightweight-charts'

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
        const response = await COW_SDK[network]?.cowSubgraphApi.runQuery<{ tokens: TokenResponse[] }>(GET_TOKENS_QUERY)
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

  const setTokensHistoricalData = useCallback(
    async (network: Network, pageIndex: number, tokenIds: string[]): Promise<void> => {
      setIsLoading(true)
      try {
        const lastDayTimestamp = Number(lastHoursTimestamp(24)) // last 24 hours
        const lastWeekTimestamp = Number(lastDaysTimestamp(7)) // last 7 days
        const responses = {} as { [tokenId: string]: Promise<SubgraphHistoricalDataResponse> | undefined }
        for (const tokenId of tokenIds) {
          const response = COW_SDK[network]?.cowSubgraphApi.runQuery<SubgraphHistoricalDataResponse>(
            GET_HISTORICAL_DATA_QUERY,
            { address: tokenId, lastDayTimestamp, lastWeekTimestamp },
          )
          responses[tokenId] = response
        }

        const tokenData = {} as { [tokenId: string]: TokenData }

        for (const address of Object.keys(responses)) {
          const response = await responses[address]
          if (!response) {
            continue
          }
          const lastDayUsdVolume = response.tokenHourlyTotals.reduce(
            (acc, curr) => acc + Number(curr.totalVolumeUsd),
            0,
          )
          const priceUsd = response.tokenHourlyTotals[0]?.averagePrice

          const lastDayTimestampFrom = Number(lastHoursTimestamp(25))
          const lastDayTimestampTo = Number(lastHoursTimestamp(23))
          const lastWeekTimestampFrom = Number(lastDaysTimestamp(8))
          const lastWeekTimestampTo = Number(lastDaysTimestamp(6))
          const lastDayPrice = response.tokenHourlyTotals.find(
            (x) => Number(x.timestamp) >= lastDayTimestampFrom && Number(x.timestamp) <= lastDayTimestampTo,
          )?.averagePrice
          const lastWeekPrice = response.tokenDailyTotals.find(
            (x) => Number(x.timestamp) >= lastWeekTimestampFrom && Number(x.timestamp) <= lastWeekTimestampTo,
          )?.averagePrice

          const prices = {
            priceUsd,
            lastDayPricePercentageDifference: lastDayPrice
              ? getPercentageDifference(Number(priceUsd), Number(lastDayPrice))
              : undefined,
            lastWeekPricePercentageDifference: lastWeekPrice
              ? getPercentageDifference(Number(priceUsd), Number(lastWeekPrice))
              : undefined,
            lastWeekUsdPrices: response.tokenDailyTotals
              .map((x) => ({
                time: Number(x.timestamp) as UTCTimestamp,
                value: Number(x.averagePrice),
              }))
              .sort((a, b) => a.time - b.time),
          }

          tokenData[address] = { lastDayUsdVolume, ...prices }
        }

        setTokens((tokens) => [...addHistoricalData(tokens, tokenData)])
        setHistoricalDataLoaded((loaded) => ({ ...loaded, [pageIndex]: true }))
      } catch (e) {
        const msg = `Failed to fetch tokens' data`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [setTokens, setHistoricalDataLoaded],
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

    setTokensHistoricalData(networkId, tableState.pageIndex || 0, tokenIds)
  }, [tableState.pageIndex, tableState.pageSize, tokens, networkId, setTokensHistoricalData, historicalDataLoaded])

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
    }
  }
`

export const GET_HISTORICAL_DATA_QUERY = gql`
  query GetHistoricalData($address: ID!, $lastDayTimestamp: Int!, $lastWeekTimestamp: Int!) {
    tokenHourlyTotals(
      first: 24
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
      first: 7
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
      token.priceUsd = values.priceUsd
      token.lastDayPricePercentageDifference = values.lastDayPricePercentageDifference
      token.lastWeekPricePercentageDifference = values.lastWeekPricePercentageDifference
      token.priceUsd = values.priceUsd
      token.lastWeekUsdPrices = values.lastWeekUsdPrices
    }
  }
  return tokens
}

export type TokenData = {
  lastDayUsdVolume?: number
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  priceUsd: string
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
}

function getPercentageDifference(a: number, b: number): number {
  return b ? ((a - b) / a) * 100 : 0
}

function lastHoursTimestamp(n: number): string {
  return (subHours(new Date(), n).getTime() / 1000).toFixed(0)
}

function lastDaysTimestamp(n: number): string {
  return (subDays(new Date(), n).getTime() / 1000).toFixed(0)
}
