import { useState, useCallback, useEffect } from 'react'
import { subMinutes, getTime } from 'date-fns'

import { Network } from 'types'
import { useMultipleErc20 } from 'hooks/useErc20'
import { getOrders, Order, RawOrder } from 'api/operator'
import { useNetworkId } from 'state/network'
import { transformOrder } from 'utils'
import { ORDERS_HISTORY_MINUTES_AGO, ORDERS_QUERY_INTERVAL } from 'apps/explorer/const'

/**
 *
 * Merge new RawOrders consulted, that may have changed status
 *
 * @param previousOrders List of orders
 * @param newOrdersFetched List of fetched block order that could have changed
 */
export function mergeNewOrders(previousOrders: Order[], newOrdersFetched: RawOrder[]): Order[] {
  if (newOrdersFetched.length === 0) return previousOrders

  // find the order up to which it is to be replaced
  const lastOrder = newOrdersFetched[newOrdersFetched.length - 1]
  const positionLastOrder = previousOrders.findIndex((o) => o.uid === lastOrder.uid)
  if (positionLastOrder === -1) {
    return newOrdersFetched.map((order) => transformOrder(order)).concat(previousOrders)
  }

  const slicedOrders: Order[] = previousOrders.slice(positionLastOrder + 1)
  return newOrdersFetched.map((order) => transformOrder(order)).concat(slicedOrders)
}

function isObjectEmpty(object: Record<string, unknown>): boolean {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  for (const key in object) {
    if (key) return false
  }

  return true
}

type Result = {
  orders: Order[]
  error: string
  isLoading: boolean
}

export function useGetOrders(ownerAddress: string): Result {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const networkId = useNetworkId() || undefined
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  const [mountNewOrders, setMountNewOrders] = useState(false)

  const fetchOrders = useCallback(
    async (network: Network, owner: string, minTimeHistoryTimeStamp = 0): Promise<void> => {
      setIsLoading(true)
      setError('')

      try {
        const ordersFetched = await getOrders({ networkId: network, owner, minValidTo: minTimeHistoryTimeStamp })
        const newErc20Addresses = ordersFetched.reduce((accumulator: string[], element) => {
          const updateAccumulator = (tokenAddress: string): void => {
            if (accumulator.indexOf(tokenAddress) === -1) {
              accumulator.push(tokenAddress)
            }
          }
          updateAccumulator(element.buyToken)
          updateAccumulator(element.sellToken)

          return accumulator
        }, [])

        setErc20Addresses(newErc20Addresses)
        // TODO -> For the moment it is neccesary to sort by date
        ordersFetched.sort((a, b) => +new Date(b.creationDate) - +new Date(a.creationDate))

        setOrders((previousOrders) => mergeNewOrders(previousOrders, ordersFetched))
        setMountNewOrders(true)
      } catch (e) {
        const msg = `Failed to fetch orders`
        console.error(msg, e)
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }
    const getOrUpdateOrders = (minHistoryTime?: number): Promise<void> =>
      fetchOrders(networkId, ownerAddress, minHistoryTime)

    getOrUpdateOrders()

    const intervalId: NodeJS.Timeout = setInterval(() => {
      const minutesAgoTimestamp = getTime(subMinutes(new Date(), ORDERS_HISTORY_MINUTES_AGO))
      getOrUpdateOrders(Math.floor(minutesAgoTimestamp / 1000))
    }, ORDERS_QUERY_INTERVAL)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [fetchOrders, networkId, ownerAddress])

  useEffect(() => {
    if (areErc20Loading || isObjectEmpty(valueErc20s) || !mountNewOrders) {
      return
    }

    const newOrders = orders.map((order) => {
      order.buyToken = valueErc20s[order.buyTokenAddress] || order.buyToken
      order.sellToken = valueErc20s[order.sellTokenAddress] || order.sellToken

      return order
    })

    setOrders(newOrders)
    setMountNewOrders(false)
  }, [valueErc20s, networkId, areErc20Loading, mountNewOrders, orders])

  return { orders, error, isLoading }
}
