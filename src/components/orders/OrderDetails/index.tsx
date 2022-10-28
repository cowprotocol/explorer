import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Order, Trade } from 'api/operator'
import { Errors } from 'types'

import { formatPercentage } from 'utils'
import { FillsTableContext } from './context/FillsTableContext'
import { media } from 'theme/styles/media'
import { useQuery } from 'hooks/useQuery'
import { DetailsTable } from 'components/orders/DetailsTable'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import RedirectToSearch from 'components/RedirectToSearch'
import { Notification } from 'components/Notification'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import CowLoading from 'components/common/CowLoading'
import TablePagination, { PaginationWrapper } from 'apps/explorer/components/common/TablePagination'
import { useTable } from 'apps/explorer/components/TokensTableWidget/useTable'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'

import { FillsTableWithData } from './FillsTableWithData'

const TitleUid = styled(RowWithCopyButton)`
  color: ${({ theme }): string => theme.grey};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1rem;
  display: flex;
  align-items: center;
`

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  gap: 1rem;
  ${media.mobile} {
    ${PaginationWrapper} {
      display: none;
    }
    justify-content: center;
  }
`

const StyledExplorerTabs = styled(ExplorerTabs)`
  margin-top: 2rem;
  &.orderDetails-tab {
    &--overview {
      .tab-content {
        padding: 0;
      }
    }
  }
`

export type Props = {
  order: Order | null
  trades: Trade[]
  isOrderLoading: boolean
  areTradesLoading: boolean
  errors: Errors
}

enum TabView {
  OVERVIEW = 1,
  FILLS,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (
  order: Order | null,
  areTradesLoading: boolean,
  isOrderLoading: boolean,
  trades: Trade[],
): TabItemInterface[] => {
  const areTokensLoaded = order?.buyToken && order?.sellToken
  const isLoadingForTheFirstTime = isOrderLoading && !areTokensLoaded
  const filledPercentage = order?.filledPercentage && formatPercentage(order.filledPercentage)

  // Only set txHash for fillOrKill orders, if any
  // Partially fillable order will have a tab only for the trades
  const txHash =
    (order && !order.partiallyFillable && trades && trades.length === 1 ? trades[0].txHash : undefined) || undefined

  return [
    {
      id: TabView.OVERVIEW,
      tab: <span>Overview</span>,
      content: (
        <>
          {order && areTokensLoaded && (
            <DetailsTable order={{ ...order, txHash }} areTradesLoading={areTradesLoading} />
          )}
          {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
          {isLoadingForTheFirstTime && (
            <EmptyItemWrapper>
              <CowLoading />
            </EmptyItemWrapper>
          )}
        </>
      ),
    },
    {
      id: TabView.FILLS,
      tab: <>{filledPercentage ? <span>Fills ({filledPercentage})</span> : <span>Fills</span>}</>,
      content: <FillsTableWithData areTokensLoaded={!!areTokensLoaded} />,
    },
  ]
}

const RESULTS_PER_PAGE = 10

export const OrderDetails: React.FC<Props> = (props) => {
  const { order, isOrderLoading, areTradesLoading, errors, trades } = props
  const { tab } = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const [redirectTo, setRedirectTo] = useState(false)
  const history = useHistory()

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < trades.length
  tableState['totalResults'] = trades.length

  const ExtraComponentNode: React.ReactNode = (
    <WrapperExtraComponents>
      {tabViewSelected === TabView.FILLS && <TablePagination context={FillsTableContext} />}
    </WrapperExtraComponents>
  )

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (order || isOrderLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return (): void => clearTimeout(timer)
  })

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return

    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(() => {
    history.replace({ search: `?tab=${TabView[tabViewSelected].toLowerCase()}` })
  }, [history, tabViewSelected])

  if (redirectTo) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <>
      <h1>
        {order && 'Order details'}
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />}
      </h1>
      <ConnectionStatus />
      {Object.keys(errors).map((key) => (
        <Notification key={key} type={errors[key].type} message={errors[key].message} />
      ))}
      <FillsTableContext.Provider
        value={{
          trades,
          isLoading: areTradesLoading,
          tableState,
          setPageSize,
          setPageOffset,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <StyledExplorerTabs
          className={`orderDetails-tab--${TabView[tabViewSelected].toLowerCase()}`}
          tabItems={tabItems(order, areTradesLoading, isOrderLoading, trades)}
          defaultTab={tabViewSelected}
          onChange={(key: number): void => onChangeTab(key)}
          extra={ExtraComponentNode}
        />
      </FillsTableContext.Provider>
    </>
  )
}
