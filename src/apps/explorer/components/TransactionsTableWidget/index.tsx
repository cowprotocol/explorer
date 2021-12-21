import React from 'react'

import { BlockchainNetwork } from '../OrdersTableWidget/context/OrdersTableContext'
import { useGetTxOrders } from 'hooks/useGetOrders'

interface Props {
  txHash: string
  networkId: BlockchainNetwork
}

export const TransactionsTableWidget: React.FC<Props> = ({ txHash }) => {
  const { orders, isLoading: isTxLoading } = useGetTxOrders(txHash)

  return isTxLoading ? <h2>Loading</h2> : <h2>{orders ? orders.length : '0'} Tx found.</h2>
}
