import { useCallback, useEffect, useState } from 'react'

import { Order, transformOrder } from 'api/operator'
import { getOrder } from 'api/operator/operatorApi'

import { useNetworkId } from 'state/network'
import { useMultipleErc20 } from './useErc20'

type UseOrderResult = {
  order: Order | null
  error?: string
  isLoading: boolean
  forceUpdate: () => void
}

export function useOrder(orderId: string, updateInterval = 0): UseOrderResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  // Hack to force component to update itself on demand
  const [forcedUpdate, setForcedUpdate] = useState({})
  const forceUpdate = useCallback((): void => setForcedUpdate({}), [])

  const networkId = useNetworkId()

  useEffect(() => {
    async function fetchOrder(): Promise<void> {
      if (!networkId) return

      setIsLoading(true)
      setError('')

      try {
        const rawOrder = await getOrder({ networkId, orderId })
        if (rawOrder) {
          setOrder(transformOrder(rawOrder))
        }
      } catch (e) {
        const msg = `Failed to fetch order: ${orderId}`
        console.error(msg, e.message)
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [networkId, orderId, forcedUpdate])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    // Only start the interval when:
    // 1. Hook is configured to do so (`updateInterval` > 0)
    // 2. Order exists
    // 3. Order is not expired
    if (updateInterval && order && order.expirationDate.getTime() > Date.now()) {
      intervalId = setInterval(forceUpdate, updateInterval)
    }

    return (): void => {
      intervalId && clearInterval(intervalId)
    }
  }, [forceUpdate, order, updateInterval])

  return { order, isLoading, error, forceUpdate }
}

type UseOrderAndErc20sResult = {
  order: Order | null
  isLoading: boolean
  errors: Record<string, string>
}

/**
 * Aggregates the fetching of the order and related erc20s
 * Optionally sets an interval of how often to update Open orders
 *
 * @param orderId The order id
 * @param updateInterval [Optional] How often should try to update the order
 */
export function useOrderAndErc20s(orderId: string, updateInterval = 0): UseOrderAndErc20sResult {
  const networkId = useNetworkId() || undefined

  const { order, isLoading: isOrderLoading, error: orderError } = useOrder(orderId, updateInterval)

  const addresses = order ? [order.buyTokenAddress, order.sellTokenAddress] : []

  const { value, isLoading: areErc20Loading, error: erc20Errors } = useMultipleErc20({ networkId, addresses })

  const errors = { ...erc20Errors }
  if (orderError) {
    errors[orderId] = orderError
  }

  if (order && value) {
    order.buyToken = value[order?.buyTokenAddress || '']
    order.sellToken = value[order?.sellTokenAddress || '']
  }

  return { order, isLoading: isOrderLoading || areErc20Loading, errors }
}
