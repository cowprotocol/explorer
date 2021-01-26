import React from 'react'

import { useParams } from 'react-router'

export const OrderWidget: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()

  return <div>You are viewing order id: {orderId}</div>
}
