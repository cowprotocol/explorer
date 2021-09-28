import React, { useMemo } from 'react'
import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTab'
import { useGetOrders } from './useGetOrders'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { useTable } from './useTable'
import { OrdersTableWithData } from './OrdersTableWithData'
import { OrdersTableContext } from './context/OrdersTableContext'
import PaginationOrdersTable from './PaginationOrdersTable'

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

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
`

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
    <PaginationOrdersTable />
  </WrapperExtraComponents>
)
interface Props {
  ownerAddress: string
}

const OrdersTableWidget: React.FC<Props> = ({ ownerAddress }) => {
  const { state: tableState, setPageSize } = useTable({ initialState: { pageIndex: 0, pageSize: 20 } })
  const { orders, isLoading, error } = useGetOrders(ownerAddress, tableState.pageSize, tableState.pageIndex)

  const isFirstLoading = useMemo(() => {
    if (isLoading && orders.length === 0) return true

    return false
  }, [isLoading, orders.length])

  return (
    <OrdersTableContext.Provider value={{ orders, error, isFirstLoading, setPageSize, tableState }}>
      <ExplorerTabs tabItems={tabItems(isLoading)} extra={ExtraComponentNode} />
    </OrdersTableContext.Provider>
  )
}

export default OrdersTableWidget
