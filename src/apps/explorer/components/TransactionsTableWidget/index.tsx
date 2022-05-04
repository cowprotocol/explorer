import React, { useState, useEffect, useCallback } from 'react'
import { faListUl, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { useHistory } from 'react-router-dom'

import { useQuery } from 'hooks/useQuery'
import { BlockchainNetwork, TransactionsTableContext } from './context/TransactionsTableContext'
import { useGetTxOrders, useTxOrderExplorerLink } from 'hooks/useGetOrders'
import RedirectToSearch from 'components/RedirectToSearch'
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
import CowLoading from 'components/common/CowLoading'

interface Props {
  txHash: string
  networkId: BlockchainNetwork
  transactions?: Order[]
}

enum TabView {
  ORDERS = 1,
  GRAPH,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (txBatchTrades: GetTxBatchTradesResult, networkId: BlockchainNetwork): TabItemInterface[] => {
  return [
    {
      id: TabView.ORDERS,
      tab: <TabIcon title="Orders" iconFontName={faListUl} />,
      content: <TransactionsTableWithData />,
    },
    {
      id: TabView.GRAPH,
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
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
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
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return

    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(() => {
    history.replace({ search: `?tab=${TabView[tabViewSelected].toLowerCase()}` })
  }, [history, tabViewSelected])

  if (errorTxPresentInNetworkId && networkId != errorTxPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorTxPresentInNetworkId} />
  }
  if (redirectTo) {
    return <RedirectToSearch data={notGpv2ExplorerData} from="tx" />
  }

  if (!orders?.length) {
    return <CowLoading />
  }

  return (
    <>
      <FlexContainer>
        <Title>Transaction details</Title>
        <CowLoading /> (DELETE THIS EXAMPLE)
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
          defaultTab={tabViewSelected}
          onChange={(key: number): void => onChangeTab(key)}
        />
      </TransactionsTableContext.Provider>
    </>
  )
}
