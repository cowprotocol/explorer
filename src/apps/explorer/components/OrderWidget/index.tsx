import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'

import { getOrder, RawOrder } from 'api/operator'

import { OrderWidgetView } from './view'
import { useMultipleErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network-in-url'
import { Network } from 'types'

export const OrderWidget: React.FC = () => {
  // TODO: move order loading to a hook
  const networkId = useNetworkId()
  const [order, setOrder] = useState<RawOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // TODO: load fills from a hook

  const { orderId } = useParams<{ orderId: string }>()

  useEffect(() => {
    // TODO: get network from a hook or something
    setIsLoading(true)

    if (!networkId) {
      return
    }

    getOrder({ networkId, orderId })
      .then((order) => {
        console.log(`got order ${order} for network ${networkId}`)
        setOrder(order)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [networkId, orderId])

  // TODO: this is just for testing. The hooks will not be here
  const networkIdOrDefault = networkId ?? Network.Mainnet

  const { isLoading: isErc20sLoading, value: erc20s } = useMultipleErc20({
    addresses: [order?.buyToken || '', order?.sellToken || ''].filter(Boolean),
    networkId: networkIdOrDefault,
  })
  const [buyToken, sellToken] = useMemo(() => {
    const buyToken = erc20s[order?.buyToken || ''] || undefined
    const sellToken = erc20s[order?.sellToken || ''] || undefined

    return [buyToken, sellToken]
  }, [order?.buyToken, order?.sellToken, erc20s])

  return (
    <OrderWidgetView
      order={order}
      isLoading={isLoading || isErc20sLoading}
      error={error}
      buyToken={buyToken}
      sellToken={sellToken}
    />
  )
}
