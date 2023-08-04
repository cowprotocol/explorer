import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { Network, UiError } from 'types'
// import { NATIVE_TOKEN_PER_NETWORK } from 'const'
import { UTCTimestamp } from 'lightweight-charts'
// import { getPercentageDifference, isNativeToken } from 'utils'
import { subgraphApiSDK } from 'cowSdk'
import { computeBatchValue } from './computeBatchValue'
const FETCH_DATA_INTERVAL = 30000 // 30 seconds

export function useGetBatches(networkId: Network | undefined): GetBatchesResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [batches, setBatches] = useState<Batch[]>([])

  const processBatchData = useCallback((data: SubgraphSettlementsResponse) => {
    const batchData = {
      id: data.id,
      txHash: data.txHash,
      firstTradeTimestamp: data.firstTradeTimestamp,
      trades: data.trades, // Adapt as necessary based on the data structure of trades
      solver: data.solver, // Adapt as necessary based on the data structure of solver
      tokens_in: extractBuyTokens(data.trades),
      tokens_out: extractSellTokens(data.trades),
      num_trades: data.trades.length,
      total_value: computeBatchValue(data).totalValue,
    }

    return batchData
  }, [])

  const fetchBatches = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      // const lastWeekTimestamp = Number(lastDaysTimestamp(8)) // last 8 days
      try {
        const response = await subgraphApiSDK.runQuery<{ settlements: SettlementsResponse[] }>(
          GET_BATCHES_QUERY,
          {},
          { chainId: network },
        )

        if (response) {
          const batchesData: Batch[] = []
          for (const settlement of response.settlements) {
            const batchData = processBatchData(settlement)
            batchesData.push(batchData)
          }
          setBatches(batchesData)
        }
      } catch (e) {
        const msg = `Failed to fetch batches`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [processBatchData],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }
    // Initial fetch
    fetchBatches(networkId)

    // Set up interval to refetch data every FETCH_DATA_INTERVAL milliseconds
    const intervalId = setInterval(() => {
      fetchBatches(networkId)
    }, FETCH_DATA_INTERVAL)

    // Clear the interval when the component unmounts
    return (): void => clearInterval(intervalId)
  }, [fetchBatches, networkId])

  return { batches, error, isLoading }
}
type GetBatchesResult = {
  batches: Batch[]
  error?: UiError
  isLoading: boolean
}

export const GET_BATCHES_QUERY = gql`
  query GetBatches($first: Int = 100, $orderBy: Settlement_orderBy, $orderDirection: OrderDirection) {
    settlements(first: 50, orderBy: firstTradeTimestamp, orderDirection: desc) {
      id
      txHash
      firstTradeTimestamp
      trades {
        id
        timestamp
        gasPrice
        feeAmount
        txHash
        buyAmount
        sellAmount
        sellToken {
          id
          address
          name
          symbol
          decimals
          priceUsd
        }
        buyToken {
          id
          address
          name
          symbol
          decimals
          priceUsd
        }
      }
      solver {
        id
        address
        firstTradeTimestamp
        isSolver
        numberOfTrades
      }
    }
  }
`

type SettlementsResponse = {
  id: string
  txHash: string
  firstTradeTimestamp: number
  trades: Trade[]
  solver: User
  tokens_in: { symbol: string; address: string; name: string }[]
  tokens_out: { symbol: string; address: string; name: string }[]
  num_trades: number
  total_value: number
}

type SubgraphSettlementsResponse = SettlementsResponse

export type Batch = SettlementsResponse
export type Trade = {
  id: string
  timestamp: number
  gasPrice: BigInt
  feeAmount: BigInt
  txHash: string
  buyAmount: number
  sellAmount: number
  sellToken: Token
  buyToken: Token
}

type Token = {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  priceUsd: number
  totalVolumeUsd: string
  hourlyTotals: TokenHourlyTotals[]
}
type User = {
  id: string
  address: string
  firstTradeTimestamp: number
  isSolver: boolean
  numberOfTrades: number
}

export type TokenDailyTotalsResponse = {
  timestamp: number
  totalVolumeUsd: string
  token: TokenResponse
}
export type TokenResponse = {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  priceUsd: number
  totalVolumeUsd: string
  hourlyTotals: TokenHourlyTotals[]
}

export type TokenHourlyTotals = {
  token: { address: string }
  timestamp: number
  totalVolumeUsd: string
  averagePrice: string
}

export type SubgraphHistoricalDataResponse = {
  tokenHourlyTotals: Array<TokenHourlyTotals>
}

export type TokenData = {
  timestamp: number
  lastDayUsdVolume?: number
  lastDayPricePercentageDifference?: number
  lastWeekPricePercentageDifference?: number
  lastWeekUsdPrices?: Array<{ time: UTCTimestamp; value: number }>
}

export type BatchValue = {
  batchId: string
  totalValue: number
}
const extractBuyTokens = (trades: Trade[]): { name: string; symbol: string; address: string }[] => {
  const tokens = trades.map((trade) => {
    const symbol =
      trade.buyToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ? 'ETH'
        : trade.buyToken.symbol
    const name =
      trade.buyToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ? 'Ethereum'
        : trade.buyToken.name

    return { name, symbol, address: trade.buyToken.address }
  })
  // Remove duplicates
  return tokens.filter((token, index) => tokens.findIndex((t) => t.address === token.address) === index)
}

const extractSellTokens = (trades: Trade[]): { name: string; symbol: string; address: string }[] => {
  const tokens = trades.map((trade) => {
    const symbol =
      trade.sellToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ? 'ETH'
        : trade.sellToken.symbol
    const name =
      trade.sellToken.address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        ? 'Ethereum'
        : trade.sellToken.name

    return { name, symbol, address: trade.sellToken.address }
  })
  // Remove duplicates
  return tokens.filter((token, index) => tokens.findIndex((t) => t.address === token.address) === index)
}
