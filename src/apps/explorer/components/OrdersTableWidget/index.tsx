import React, { useMemo } from 'react'
import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTab'
import { OrdersTableWithData } from './OrdersTableWithData'
import { OrdersTableContext } from './context/OrdersTableContext'
import { useGetOrders } from './useGetOrders'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

const StyledTabLoader = styled.span`
  padding-left: 4px;
`

const tabItems = (isLoadingOrders: boolean): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Orders
          <StyledTabLoader>{isLoadingOrders && <FontAwesomeIcon icon={faSpinner} spin size="1x" />}</StyledTabLoader>
        </>
      ),
      content: <OrdersTableWithData />,
    },
  ]
}

interface Props {
  ownerAddress: string
}

const OrdersTableWidget: React.FC<Props> = ({ ownerAddress }) => {
  const { orders, isLoading, error } = useGetOrders(ownerAddress)

  const isFirstLoading = useMemo(() => {
    if (isLoading && orders.length === 0) return true

    return false
  }, [isLoading, orders.length])

  return (
    <OrdersTableContext.Provider value={{ orders, error, isFirstLoading }}>
      <ExplorerTabs tabItems={tabItems(isLoading)} />
    </OrdersTableContext.Provider>
  )
}

export default OrdersTableWidget
