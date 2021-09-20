import React, { useContext } from 'react'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import OrdersTable from 'components/orders/OrdersUserDetailsTable'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { OrdersTableContext } from './context/OrdersTableContext'

export const OrdersTableWithData: React.FC = () => {
  const { orders, isFirstLoading } = useContext(OrdersTableContext)

  return isFirstLoading ? (
    <EmptyItemWrapper>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
    </EmptyItemWrapper>
  ) : (
    <OrdersTable orders={orders} />
  )
}
