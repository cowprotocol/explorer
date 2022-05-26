import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { subDays, subHours } from 'date-fns'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { getHistoricalData, HistoricalDataResponse } from 'api/coingecko'
import { UTCTimestamp } from 'lightweight-charts'

export function useGetTokens(networkId: Network | undefined, tableState: TableState): GetTokensResult {
  const [isLoading, setIsLoading] = useState(false)
  const [volumeLoaded, setVolumeLoaded] = useState<{ [pageIndex: string]: boolean }>({})
  const [pricesLoaded, setPricesLoaded] = useState<{ [pageIndex: string]: boolean }>({})
  const [error, setError] = useState<UiError>()
  const [tokens, setTokens] = useState<Token[]>([])

  const fetchTokens = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      setTokens([])
      setPricesLoaded({})
      setVolumeLoaded({})
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
        const fromTimestamp = Number((subHours(new Date(), 24).getTime() / 1000).toFixed(0)) // last 24 hours
        const responses = {} as { [tokenId: string]: Promise<SubgraphHistoricalDataResponse> | undefined }
        for (const tokenId of tokenIds) {
          const response = COW_SDK[network]?.cowSubgraphApi.runQuery<SubgraphHistoricalDataResponse>(
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

  const setTokensPrices = useCallback(
    async (network: Network, pageIndex: number, tokenIds: string[]): Promise<void> => {
      setIsLoading(true)
      try {
        const requests: Array<[string, Promise<HistoricalDataResponse | null>]> = tokenIds.map((tokenId) => [
          tokenId,
          getHistoricalData({ chainId: network, tokenAddress: tokenId, days: 7 }),
        ])

        const pastDayTimestamp = subHours(new Date(), 24).getTime()
        const pastWeekTimestamp = subDays(new Date(), 7).getTime()

        const tokenPrices = {} as { [tokenId: string]: TokenPrice }

        for (const request of requests) {
          try {
            const data = await request[1]

            const lastDayPrice = data?.prices.find((x) => x[0] > pastDayTimestamp)
            const lastWeekPrice = data?.prices.find((x) => x[0] > pastWeekTimestamp)

            const pricesRaw = {
              current: data?.prices[data.prices.length - 1][1] || 0,
              lastDayPrice: lastDayPrice?.[1] || 0,
              lastWeekPrice: lastWeekPrice?.[1] || 0,
            }

            const prices = {
              priceUsd: String(pricesRaw.current),
              lastDayPricePercentageDifference: getPercentageDifference(pricesRaw.current, pricesRaw.lastDayPrice),
              lastWeekPricePercentageDifference: getPercentageDifference(pricesRaw.current, pricesRaw.lastWeekPrice),
              lastWeekUsdPrices: data?.prices.map((x) => ({
                time: (x[0] / 1000) as UTCTimestamp,
                value: x[1],
              })),
            }

            tokenPrices[request[0]] = prices
          } catch (error) {
            console.info(`Failed to fetch Coingecko token prices for ${request[0]}`)
          }
        }

        setTokens((tokens) => [...addPricesHistoricalData(tokens, tokenPrices)])
        setPricesLoaded((pricesLoaded) => ({ ...pricesLoaded, [pageIndex]: true }))
      } catch (e) {
        const msg = `Failed to fetch tokens' prices`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [setTokens, setPricesLoaded],
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
  }, [tableState.pageIndex, tableState.pageSize, tokens, networkId, setTokensVolume, setTokensPrices, volumeLoaded])

  useEffect(() => {
    if (tokens.length === 0 || !networkId || !tableState.pageIndex || pricesLoaded[tableState.pageIndex]) {
      return
    }

    const pageTokens = tokens.slice(
      (tableState.pageIndex - 1) * tableState.pageSize,
      tableState.pageIndex * tableState.pageSize,
    )
    const tokenIds = pageTokens.map((token) => token.id)

    setTokensPrices(networkId, tableState.pageIndex || 0, tokenIds)
  }, [tableState.pageIndex, tableState.pageSize, tokens, networkId, setTokensVolume, setTokensPrices, pricesLoaded])

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
  query GetTokenLastDayVolume($address: ID!, $fromTimestamp: Int!) {
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
  timestamp: number
  totalVolumeUsd: string
}

export type SubgraphHistoricalDataResponse = {
  tokenHourlyTotals: Array<TokenTotals>
}

export type Token = {
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  lastDayUsdVolume?: number
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
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

export type TokenPrice = {
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  priceUsd: string
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
}

function addPricesHistoricalData(tokens: Token[], prices: { [tokenId: string]: TokenPrice }): Token[] {
  for (const address of Object.keys(prices)) {
    const token = tokens.find((token) => token.address === address)
    const price = prices[address]

    if (token) {
      token.priceUsd = price.priceUsd
      token.lastDayPricePercentageDifference = price.lastDayPricePercentageDifference
      token.lastWeekPricePercentageDifference = price.lastWeekPricePercentageDifference
      token.priceUsd = price.priceUsd
      token.lastWeekUsdPrices = price.lastWeekUsdPrices
    }
  }

  return tokens
}

function getPercentageDifference(a: number, b: number): number {
  return b ? ((a - b) / a) * 100 : 0
}
