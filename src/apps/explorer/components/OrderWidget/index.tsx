import React from 'react'
import { useParams } from 'react-router'

import { useOrderAndErc20s } from 'hooks/useOperatorOrder'

import { ORDER_QUERY_INTERVAL } from 'apps/explorer/const'

import { OrderWidgetView } from './view'

export const OrderWidget: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()

  const { order, isLoading, errors } = useOrderAndErc20s(orderId, ORDER_QUERY_INTERVAL)

  return <OrderWidgetView order={order} isLoading={isLoading} errors={errors} />
}
