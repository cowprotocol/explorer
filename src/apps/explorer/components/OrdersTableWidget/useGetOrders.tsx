import { useState, useCallback, useEffect } from 'react'

import { Network } from 'types'
import { useMultipleErc20 } from 'hooks/useErc20'
import { getAccountOrders, Order } from 'api/operator'
import { useNetworkId } from 'state/network'
import { transformOrder } from 'utils'
import { ORDERS_QUERY_INTERVAL } from 'apps/explorer/const'

function isObjectEmpty(object: Record<string, unknown>): boolean {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  for (const key in object) {
    if (key) return false
  }

  return true
}

type Result = {
  orders: Order[] | undefined
  error: string
  isLoading: boolean
  isThereNext: boolean
}

export function useGetOrders(ownerAddress: string, limit = 1000, offset = 0, pageIndex?: number): Result {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[] | undefined>()
  const networkId = useNetworkId() || undefined
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  const [mountNewOrders, setMountNewOrders] = useState(false)
  const [isThereNext, setIsThereNext] = useState(false)

  useEffect(() => {
    setOrders(undefined)
    setMountNewOrders(false)
  }, [networkId])

  const fetchOrders = useCallback(
    async (network: Network, owner: string): Promise<void> => {
      setIsLoading(true)
      setError('')
      const limitPlusOne = limit + 1

      try {
        const ordersFetched = await getAccountOrders({ networkId: network, owner, offset, limit: limitPlusOne })
        if (ordersFetched.length === limitPlusOne) {
          setIsThereNext(true)
          ordersFetched.pop()
        }
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

        setOrders(ordersFetched.map((order) => transformOrder(order)))
        setMountNewOrders(true)
      } catch (e) {
        const msg = `Failed to fetch orders`
        console.error(msg, e)
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [limit, offset],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    setIsThereNext(false)
    fetchOrders(networkId, ownerAddress)

    if (pageIndex && pageIndex > 1) return

    const intervalId: NodeJS.Timeout = setInterval(() => {
      fetchOrders(networkId, ownerAddress)
    }, ORDERS_QUERY_INTERVAL)

    return (): void => {
      clearInterval(intervalId)
    }
  }, [fetchOrders, networkId, ownerAddress, pageIndex])

  useEffect(() => {
    if (!orders || areErc20Loading || isObjectEmpty(valueErc20s) || !mountNewOrders) {
      return
    }

    const newOrders = orders.map((order) => {
      order.buyToken = valueErc20s[order.buyTokenAddress] || order.buyToken
      order.sellToken = valueErc20s[order.sellTokenAddress] || order.sellToken

      return order
    })

    setOrders(newOrders)
    setMountNewOrders(false)
    setErc20Addresses([])
  }, [valueErc20s, networkId, areErc20Loading, mountNewOrders, orders])

  return { orders, error, isLoading, isThereNext }
}
