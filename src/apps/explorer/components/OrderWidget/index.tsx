import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router'

import { getOrder, RawOrder } from 'api/operator'

import { OrderDetails } from './OrderDetails'

// TODO: create a `View` component to abstract display elements away from logic/hooks
const Wrapper = styled.div`
  padding: 4rem 3rem;

  > * {
    margin-bottom: 2rem;
  }
`

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
    <Wrapper>
      <h2>Order details</h2>
      {order ? <OrderDetails order={order} /> : <p>Order not found</p>}
      <h2>Order fills</h2>
      <p>No fills</p>
      {error && <p>{error}</p>}
    </Wrapper>
  )
}
