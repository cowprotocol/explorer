import React from 'react'

import { Order } from 'api/operator'
import { Network } from 'types'
import { TableState, TableStateSetters } from 'apps/explorer/components/OrdersTableWidget/useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  addressAccountParams: { networkId: BlockchainNetwork; ownerAddress: string }
  orders: Order[] | undefined
  error: string
  isOrdersLoading: boolean
  tableState: TableState
} & TableStateSetters

export const OrdersTableContext = React.createContext({} as CommonState)
