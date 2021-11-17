import React, { useContext, useState, useEffect } from 'react'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import OrdersTable from 'components/orders/OrdersUserDetailsTable'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { OrdersTableContext } from './context/OrdersTableContext'
import useFirstRender from 'hooks/useFirstRender'
import { DEFAULT_TIMEOUT } from 'const'
import { useSearchInAnotherNetwork, EmptyOrdersMessage } from './useSearchInAnotherNetwork'

export const OrdersTableWithData: React.FC = () => {
  const {
    orders,
    addressAccountParams: { ownerAddress, networkId },
  } = useContext(OrdersTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)
  const {
    isLoading: searchInAnotherNetworkState,
    ordersInNetworks,
    setLoadingState,
  } = useSearchInAnotherNetwork(networkId, ownerAddress, orders)

  useEffect(() => {
    let timeOutMs = 0
    if (!orders) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [orders, orders?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
    </EmptyItemWrapper>
  ) : (
    <OrdersTable
      orders={orders}
      messageWhenEmpty={
        <EmptyOrdersMessage
          isLoading={searchInAnotherNetworkState}
          networkId={networkId}
          ordersInNetworks={ordersInNetworks}
          ownerAddress={ownerAddress}
          setLoadingState={setLoadingState}
        />
      }
    />
  )
}
