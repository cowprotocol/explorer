import React from 'react'

import { useOrderIdParam } from 'hooks/useSanitizeOrderIdAndUpdateUrl'
import { isAnOrderId } from 'utils'

import RedirectToSearch from 'components/RedirectToSearch'
import { OrderWidget } from 'apps/explorer/components/OrderWidget'
import { WrapperPage } from './styled'

const Order: React.FC = () => {
  const orderId = useOrderIdParam()

  if (!isAnOrderId(orderId)) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <WrapperPage>
      <OrderWidget />
    </WrapperPage>
  )
}

export default Order
