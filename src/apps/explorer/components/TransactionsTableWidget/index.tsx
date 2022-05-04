import React, { useState, useEffect } from 'react'

import { BlockchainNetwork, TransactionsTableContext } from './context/TransactionsTableContext'
import { useGetTxOrders, useTxOrderExplorerLink } from 'hooks/useGetOrders'
import RedirectToSearch from 'components/RedirectToSearch'
import Spinner from 'components/common/Spinner'
import { RedirectToNetwork, useNetworkId } from 'state/network'
import { Order } from 'api/operator'
import { TransactionsTableWithData } from 'apps/explorer/components/TransactionsTableWidget/TransactionsTableWithData'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTab'
import { TitleAddress, FlexContainer, StyledTabLoader, BVButton, Title } from 'apps/explorer/pages/styled'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { useTxBatchTrades } from 'hooks/useTxBatchTrades'
import { faListUl, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TransactionBatchGraph from 'apps/explorer/components/TransanctionBatchGraph'
import CowLoading from 'components/common/CowLoading'

interface Props {
  txHash: string
  networkId: BlockchainNetwork
  transactions?: Order[]
}

const tabItems = (isLoadingOrders: boolean): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Orders
          <StyledTabLoader>{isLoadingOrders && <Spinner spin size="1x" />}</StyledTabLoader>
        </>
      ),
      content: <TransactionsTableWithData />,
    },
  ]
}

export const TransactionsTableWidget: React.FC<Props> = ({ txHash }) => {
  const { orders, isLoading: isTxLoading, errorTxPresentInNetworkId, error } = useGetTxOrders(txHash)
  const networkId = useNetworkId() || undefined
  const [redirectTo, setRedirectTo] = useState(false)
  const [batchViewer, setBatchViewer] = useState(false)
  const txHashParams = { networkId, txHash }
  const isZeroOrders = !!(orders && orders.length === 0)
  const notGpv2ExplorerData = useTxOrderExplorerLink(txHash, isZeroOrders)
  const txBatchTrades = useTxBatchTrades(networkId, txHash, orders && orders.length)

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (orders?.length || isTxLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return (): void => clearTimeout(timer)
  })

  if (errorTxPresentInNetworkId && networkId != errorTxPresentInNetworkId) {
    return <RedirectToNetwork networkId={errorTxPresentInNetworkId} />
  }
  if (redirectTo) {
    return <RedirectToSearch data={notGpv2ExplorerData} from="tx" />
  }

  if (!orders?.length) {
    return <CowLoading />
  }

  const batchViewerButtonName = batchViewer ? 'Show Transactions list' : 'Show Batch Viewer'
  const batchViewerButtonIcon = batchViewer ? faListUl : faProjectDiagram

  return (
    <>
      <FlexContainer>
        <Title>Transaction details</Title>
        <CowLoading /> (DELETE THIS EXAMPLE)
        <TitleAddress
          textToCopy={txHash}
          contentsToDisplay={<BlockExplorerLink type="tx" networkId={networkId} identifier={txHash} showLogo />}
        />
        <BVButton onClick={(): void => setBatchViewer(!batchViewer)}>
          <FontAwesomeIcon icon={batchViewerButtonIcon} />
          {batchViewerButtonName}
        </BVButton>
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
        {batchViewer ? (
          <TransactionBatchGraph txBatchData={txBatchTrades} networkId={networkId} />
        ) : (
          <ExplorerTabs tabItems={tabItems(isTxLoading)} />
        )}
      </TransactionsTableContext.Provider>
    </>
  )
}
