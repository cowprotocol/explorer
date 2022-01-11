import React, { useState, useEffect } from 'react'

import { TitleAddress } from 'apps/explorer/pages/styled'
import { useGetTxOrders } from 'hooks/useGetOrders'
import RedirectToSearch from 'components/RedirectToSearch'
import Spinner from 'components/common/Spinner'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { RedirectToNetwork, useNetworkId } from 'state/network'

interface Props {
  txHash: string
}

export const TransactionsTableWidget: React.FC<Props> = ({ txHash }) => {
  const { orders, isLoading: isTxLoading, errorTxPresentInNetworkId } = useGetTxOrders(txHash)
  const networkId = useNetworkId() || undefined
  const [redirectTo, setRedirectTo] = useState(false)

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
    return <RedirectToSearch from="tx" />
  }

  if (!orders?.length) {
    return <Spinner spin size="3x" />
  }

  // TODO replace with a real table component
  return (
    <>
      <h1>
        Transaction details
        <TitleAddress
          textToCopy={txHash}
          contentsToDisplay={<BlockExplorerLink type="tx" networkId={networkId} identifier={txHash} />}
        />
      </h1>
      <h2>{orders.length} Tx orders found.</h2>
    </>
  )
}
