import React from 'react'
import { useParams } from 'react-router'

import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { TitleAddress, WrapperPage } from 'apps/explorer/pages/styled'
import { useNetworkId } from 'state/network'
import { TransactionsTableWidget } from 'apps/explorer/components/TransactionsTableWidget'

const TransactionDetails: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>()
  const networkId = useNetworkId() || undefined

  // TODO Validate txHash
  return (
    <WrapperPage>
      <h1>
        Transaction details
        <TitleAddress
          textToCopy={txHash}
          contentsToDisplay={<BlockExplorerLink type="tx" networkId={networkId} identifier={txHash} />}
        />
      </h1>
      <TransactionsTableWidget txHash={txHash} networkId={networkId} />
    </WrapperPage>
  )
}

export default TransactionDetails
