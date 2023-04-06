import { getTrades, Order, RawTrade, Trade } from 'api/operator'
import { useCallback, useEffect, useState } from 'react'
import { useNetworkId } from 'state/network'
import { Network, UiError } from 'types'
import { transformTrade } from 'utils'
import { web3 } from 'apps/explorer/api'

type Result = {
  trades: Trade[]
  error?: UiError
  isLoading: boolean
}

type TradesTimestamps = { [txHash: string]: number }

const tradesTimestampsCache: { [blockNumber: number]: number } = {}

async function fetchTradesTimestamps(rawTrades: RawTrade[]): Promise<TradesTimestamps> {
  const requests = rawTrades.map(({ txHash, blockNumber }) => {
    const cachedValue = tradesTimestampsCache[blockNumber]

    if (cachedValue) {
      return { txHash, timestamp: cachedValue }
    }

    return web3.eth.getBlock(blockNumber).then(res => {
      const timestamp = +res.timestamp

      tradesTimestampsCache[blockNumber] = timestamp

      return { txHash, timestamp }
    })
  })

  const data = await Promise.all(requests)

  return data.reduce((acc, val) => {
    if (val.txHash) acc[val.txHash] = val.timestamp

    return acc
  }, {} as TradesTimestamps)
}

/**
 * Fetches trades for given order
 */
export function useOrderTrades(order: Order | null): Result {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [trades, setTrades] = useState<Trade[]>([])
  const [rawTrades, setRawTrades] = useState<RawTrade[]>([])
  const [tradesTimestamps, setTradesTimestamps] = useState<TradesTimestamps>({})

  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()

  const fetchTrades = useCallback(
    async (controller: AbortController, _networkId: Network): Promise<void> => {
      if (!order) return

      setIsLoading(true)

      const { uid: orderId } = order

      try {
        const trades = await getTrades({ networkId: _networkId, orderId  })

        if (controller.signal.aborted) return

        setRawTrades(trades)
        setError(undefined)
      } catch (e) {
        const msg = `Failed to fetch trades`
        console.error(msg, e)

        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [order],
  )

  // Fetch blocks timestamps for trades
  useEffect(() => {
    fetchTradesTimestamps(rawTrades).then(setTradesTimestamps).catch(error => {
      console.error('Trades timestamps fetching error: ', error)

      setTradesTimestamps({})
    })
  }, [rawTrades])

  // Transform trades adding tokens and timestamps
  useEffect(() => {
    if (!order) return

    const { buyToken, sellToken } = order

    const trades = rawTrades.map((trade) => {
      const timestamp = trade.txHash ? tradesTimestamps[trade.txHash] : undefined

      return { ...transformTrade(trade, timestamp), buyToken, sellToken }
    })

    setTrades(trades)
  }, [order, rawTrades, tradesTimestamps])

  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()

  useEffect(() => {
    if (!networkId || !order?.uid) {
      return
    }

    const controller = new AbortController()

    fetchTrades(controller, networkId)
    return (): void => controller.abort()
    // Depending on order UID to avoid re-fetching when obj changes but ID remains the same
    // Depending on `executedBuy/SellAmount`s string to force a refetch when there are new trades
    // using the string version because hooks are bad at detecting Object changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrades, networkId, order?.uid, executedSellAmount, executedBuyAmount])

  return { trades, error, isLoading }
}
