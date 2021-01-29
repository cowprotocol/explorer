import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { getOrder, RawOrder } from 'api/operator'

import { OrderWidgetView } from './view'

export const OrderWidget: React.FC = () => {
  // TODO: move order loading to a hook
  const [order, setOrder] = useState<RawOrder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // TODO: load fills from a hook

  const { orderId } = useParams<{ orderId: string }>()

  useEffect(() => {
    // TODO: get network from a hook or something
    setIsLoading(true)
    getOrder({ networkId: 4, orderId })
      .then((order) => {
        console.log('got order', order)
        setOrder(order)
        setError('')
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [orderId])

  return <OrderWidgetView order={order} isLoading={isLoading} error={error} />
}
