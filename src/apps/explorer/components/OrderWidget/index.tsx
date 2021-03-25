import React from 'react'

import { useOrderAndErc20s } from 'hooks/useOperatorOrder'
import { useOrderId } from 'hooks/useOrderId'

import { ORDER_QUERY_INTERVAL } from 'apps/explorer/const'

import { OrderDetails } from 'components/orders/OrderDetails'
import { RedirectToNetwork, useNetworkId } from 'state/network'

export const OrderWidget: React.FC = () => {
  const networkId = useNetworkId()
  const orderId = useOrderId()

  const { order, isLoading, errors, errorOrderPresentInNetworkId } = useOrderAndErc20s(orderId, ORDER_QUERY_INTERVAL)

  if (errorOrderPresentInNetworkId && networkId != errorOrderPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorOrderPresentInNetworkId} />
  }

  return <OrderDetails order={order} isLoading={isLoading} errors={errors} />
}
