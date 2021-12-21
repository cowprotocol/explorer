import { useState, useEffect, useCallback } from 'react'

import { Network } from 'types'
import { useMultipleErc20 } from 'hooks/useErc20'
import { getAccountOrders, getTxOrders, Order } from 'api/operator'
import { RawOrder } from 'api/operator/types'
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

function filterDuplicateErc20Addresses(ordersFetched: RawOrder[]): string[] {
  return ordersFetched.reduce((accumulator: string[], element) => {
    const updateAccumulator = (tokenAddress: string): void => {
      if (accumulator.indexOf(tokenAddress) === -1) {
        accumulator.push(tokenAddress)
      }
    }
    updateAccumulator(element.buyToken)
    updateAccumulator(element.sellToken)

    return accumulator
  }, [])
}

type Result = {
  orders: Order[] | undefined
  error: string
  isLoading: boolean
  isThereNext?: boolean
}

interface UseOrdersWithTokenInfo {
  orders: Order[] | undefined
  setOrders: (value: Order[] | undefined) => void
  setMountNewOrders: (value: boolean) => void
  setErc20Addresses: (value: string[]) => void
}

function useOrdersWithTokenInfo(networkId: Network | undefined): UseOrdersWithTokenInfo {
  const [orders, setOrders] = useState<Order[] | undefined>()
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })
  const [mountNewOrders, setMountNewOrders] = useState(false)

  useEffect(() => {
    setOrders(undefined)
    setMountNewOrders(false)
  }, [networkId])

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

  return { orders, setOrders, setMountNewOrders, setErc20Addresses }
}

export function useGetTxOrders(txHash: string): Result {
  const networkId = useNetworkId() || undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { orders, setOrders, setMountNewOrders, setErc20Addresses } = useOrdersWithTokenInfo(networkId)

  const fetchOrders = useCallback(
    async (network: Network, _txHash: string): Promise<void> => {
      setIsLoading(true)
      setError('')

      try {
        const ordersFetched = await getTxOrders({ networkId: network, txHash: _txHash })
        const newErc20Addresses = filterDuplicateErc20Addresses(ordersFetched)

        setErc20Addresses(newErc20Addresses)

        setOrders(ordersFetched.map((order) => transformOrder(order)))
        setMountNewOrders(true)
      } catch (e) {
        const msg = `Failed to fetch tx orders`
        console.error(msg, e)
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [setErc20Addresses, setMountNewOrders, setOrders],
  )

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchOrders(networkId, txHash)
  }, [fetchOrders, networkId, txHash])

  return { orders, error, isLoading }
}

export function useGetAccountOrders(ownerAddress: string, limit = 1000, offset = 0, pageIndex?: number): Result {
  const networkId = useNetworkId() || undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { orders, setOrders, setMountNewOrders, setErc20Addresses } = useOrdersWithTokenInfo(networkId)
  const [isThereNext, setIsThereNext] = useState(false)

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
        const newErc20Addresses = filterDuplicateErc20Addresses(ordersFetched)
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
    [limit, offset, setErc20Addresses, setMountNewOrders, setOrders],
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

  return { orders, error, isLoading, isThereNext }
}
