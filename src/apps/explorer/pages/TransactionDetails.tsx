import React from 'react'
import { useParams } from 'react-router'

import { isATxHash } from 'utils'
import RedirectToSearch from 'components/RedirectToSearch'
import { WrapperPage } from 'apps/explorer/pages/styled'
import { TransactionsTableWidget } from 'apps/explorer/components/TransactionsTableWidget'

const TransactionDetails: React.FC = () => {
  const { txHash } = useParams<{ txHash: string }>()

  if (!isATxHash(txHash)) {
    return <RedirectToSearch from="tx" />
  }

  return (
    <WrapperPage>
      <TransactionsTableWidget txHash={txHash} />
    </WrapperPage>
  )
}

export default TransactionDetails
