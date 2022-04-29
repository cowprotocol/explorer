import React, { useState, useEffect, useRef, useCallback } from 'react'
import { faListUl, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from 'react-router-dom'

import { useQuery } from 'hooks/useQuery'
import { BlockchainNetwork, TransactionsTableContext } from './context/TransactionsTableContext'
import { useGetTxOrders, useTxOrderExplorerLink } from 'hooks/useGetOrders'
import RedirectToSearch from 'components/RedirectToSearch'
import Spinner from 'components/common/Spinner'
import { RedirectToNetwork, useNetworkId } from 'state/network'
import { Order } from 'api/operator'
import { TransactionsTableWithData } from 'apps/explorer/components/TransactionsTableWidget/TransactionsTableWithData'
import { TabItemInterface, TabIcon } from 'components/common/Tabs/Tabs'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import { TitleAddress, FlexContainer, Title } from 'apps/explorer/pages/styled'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { useTxBatchTrades, GetTxBatchTradesResult } from 'hooks/useTxBatchTrades'
import TransactionBatchGraph from 'apps/explorer/components/TransanctionBatchGraph'

interface Props {
  txHash: string
  networkId: BlockchainNetwork
  transactions?: Order[]
}

enum TabViews {
  GRAPH = 'graph',
  ORDERS = 'orders',
}

const TAB_VIEW_ID = {
  [TabViews.ORDERS]: 1,
  [TabViews.GRAPH]: 2,
}

const DEFAULT_TAB = TabViews.ORDERS

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab') || DEFAULT_TAB }
}

const tabItems = (txBatchTrades: GetTxBatchTradesResult, networkId: BlockchainNetwork): TabItemInterface[] => {
  return [
    {
      id: TAB_VIEW_ID[TabViews.ORDERS],
      tab: <TabIcon title="Orders" iconFontName={faListUl} />,
      content: <TransactionsTableWithData />,
    },
    {
      id: TAB_VIEW_ID[TabViews.GRAPH],
      tab: <TabIcon title="Graph" iconFontName={faProjectDiagram} />,
      content: <TransactionBatchGraph txBatchData={txBatchTrades} networkId={networkId} />,
    },
  ]
}

export const TransactionsTableWidget: React.FC<Props> = ({ txHash }) => {
  const { orders, isLoading: isTxLoading, errorTxPresentInNetworkId, error } = useGetTxOrders(txHash)
  const networkId = useNetworkId() || undefined
  const [redirectTo, setRedirectTo] = useState(false)
  const { tab } = useQueryViewParams()
  const [tabViewName, setTabViewName] = useState<TabViews>(
    (Object.values(TabViews).includes(tab as TabViews) && (tab as TabViews)) || TabViews.ORDERS,
  )
  const tabSelectedId = useRef(TAB_VIEW_ID[tabViewName])
  const txHashParams = { networkId, txHash }
  const isZeroOrders = !!(orders && orders.length === 0)
  const notGpv2ExplorerData = useTxOrderExplorerLink(txHash, isZeroOrders)
  const txBatchTrades = useTxBatchTrades(networkId, txHash, orders && orders.length)
  const history = useHistory()

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (orders?.length || isTxLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return (): void => clearTimeout(timer)
  })

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = Object.keys(TAB_VIEW_ID).find((key) => TAB_VIEW_ID[key as TabViews] === tabId)
    if (!newTabViewName) return

    setTabViewName(newTabViewName as TabViews)
    tabSelectedId.current = tabId
  }, [])

  useEffect(() => {
    history.replace({ search: `?tab=${tabViewName}` })
  }, [history, tabViewName])

  if (errorTxPresentInNetworkId && networkId != errorTxPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorTxPresentInNetworkId} />
  }
  if (redirectTo) {
    return <RedirectToSearch data={notGpv2ExplorerData} from="tx" />
  }

  if (!orders?.length) {
    return <Spinner spin size="3x" />
  }

  return (
    <>
      <FlexContainer>
        <Title>Transaction details</Title>
        <TitleAddress
          textToCopy={txHash}
          contentsToDisplay={<BlockExplorerLink type="tx" networkId={networkId} identifier={txHash} showLogo />}
        />
      </FlexContainer>
      <ConnectionStatus />
      {error && <Notification type={error.type} message={error.message} />}
      <TransactionsTableContext.Provider
        value={{
          orders,
          txHashParams,
          error,
          isTxLoading,
        }}
      >
        <ExplorerTabs
          tabItems={tabItems(txBatchTrades, networkId)}
          defaultTab={tabSelectedId.current}
          onChange={(key: number): void => onChangeTab(key)}
        />
      </TransactionsTableContext.Provider>
    </>
  )
}
