import React, { useContext, useState, useEffect } from 'react'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import OrdersTable from 'components/orders/OrdersUserDetailsTable'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { OrdersTableContext } from './context/OrdersTableContext'
import useFirstRender from 'hooks/useFirstRender'

export const OrdersTableWithData: React.FC = () => {
  const { orders } = useContext(OrdersTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    let timeOutSeconds = 0
    if (!orders.length) {
      timeOutSeconds = 3
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutSeconds * 1000)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [orders.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
    </EmptyItemWrapper>
  ) : (
    <OrdersTable orders={orders} />
  )
}
