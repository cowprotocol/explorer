import { TradeMetaData } from '@cowprotocol/cow-sdk'
import { getTrades, Order, Trade } from 'api/operator'
import { useCallback, useEffect, useState } from 'react'
import { useNetworkId } from 'state/network'
import { Network, UiError } from 'types'
import { transformTrade } from 'utils'

type Params = {
  owner?: string
  orderId?: string
}

type Result = {
  trades: Trade[]
  error?: UiError
  isLoading: boolean
}

/**
 * Fetches trades for given filters
 * When no filter is given, fetches all trades for current network
 */
export function useTrades(params: Params): Result {
  const { owner, orderId } = params

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [trades, setTrades] = useState<Trade[]>([])

  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()

  const fetchTrades = useCallback(async (networkId: Network, owner?: string, orderId?: string): Promise<void> => {
    setIsLoading(true)

    try {
      let trades: TradeMetaData[] = []
      if (orderId) {
        trades = await getTrades({ networkId, orderId })
      } else if (owner) {
        trades = await getTrades({ networkId, owner })
      }

      // TODO: fetch buy/sellToken objects
      setTrades(trades.map((trade) => transformTrade(trade)))
      setError(undefined)
    } catch (e) {
      const msg = `Failed to fetch trades`
      console.error(msg, e)
      setError({ message: msg, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchTrades(networkId, owner, orderId)
  }, [fetchTrades, networkId, orderId, owner])

  return { trades, error, isLoading }
}

/**
 * Fetches trades for given order
 */
export function useOrderTrades(order: Order | null): Result {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [trades, setTrades] = useState<Trade[]>([])

  // Here we assume that we are already in the right network
  // contrary to useOrder hook, where it searches all networks for a given orderId
  const networkId = useNetworkId()

  const fetchTrades = useCallback(
    async (controller: AbortController, _networkId: Network, _order: Order): Promise<void> => {
      setIsLoading(true)

      const { uid: orderId, buyToken, sellToken } = _order

      try {
        const _trades = await getTrades({ networkId: _networkId, orderId })

        if (controller.signal.aborted) return

        setTrades(_trades.map((trade) => ({ ...transformTrade(trade), buyToken, sellToken })))
        setError(undefined)
      } catch (e) {
        const msg = `Failed to fetch trades`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const executedSellAmount = order?.executedSellAmount.toString()
  const executedBuyAmount = order?.executedBuyAmount.toString()
  useEffect(() => {
    if (!networkId || !order?.uid) {
      return
    }
    const controller = new AbortController()

    fetchTrades(controller, networkId, order)
    return (): void => controller.abort()
    // Depending on order UID to avoid re-fetching when obj changes but ID remains the same
    // Depending on `executedBuy/SellAmount`s string to force a refetch when there are new trades
    // using the string version because hooks are bad at detecting Object changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrades, networkId, order?.uid, executedSellAmount, executedBuyAmount])

  return { trades, error, isLoading }
}
