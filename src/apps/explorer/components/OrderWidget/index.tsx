import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { getOrder, RawOrder } from 'api/operator'

import { OrderWidgetView } from './view'
import { useErc20 } from 'hooks/useErc20'
import { useNetworkId } from 'state/network'
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
  const { value: buyToken } = useErc20({ address: order?.buyToken, networkId: networkIdOrDefault })
  const { value: sellToken } = useErc20({ address: order?.sellToken, networkId: networkIdOrDefault })

  console.log(`buy token`, buyToken)
  console.log(`sell token`, sellToken)

  return <OrderWidgetView order={order} isLoading={isLoading} error={error} />
}
