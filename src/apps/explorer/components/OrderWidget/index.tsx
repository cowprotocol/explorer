import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { getOrder, RawOrder } from 'api/operator'

export const OrderWidget: React.FC = () => {
  const [order, setOrder] = useState<RawOrder | null>(null)
  const [error, setError] = useState('')

  const { orderId } = useParams<{ orderId: string }>()

  useEffect(() => {
    // TODO: get network from a hook or something
    getOrder({ networkId: 4, orderId })
      .then((order) => {
        console.log('got order', order)
        setOrder(order)
        setError('')
      })
      .catch((e) => setError(e.message))
  }, [orderId])

  return (
    <div>
      <h1>Details for order id: {orderId}</h1>
      {order && <p>{JSON.stringify(order)}</p>}
      {error && <p>{error}</p>}
    </div>
  )
}
