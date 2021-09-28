import React from 'react'

import { Order } from 'api/operator'
import { TableState } from 'apps/explorer/components/OrdersTableWidget/useTable'

interface CommonState {
  orders: Order[]
  error: string
  isFirstLoading: boolean
  setPageSize: (pageSize: number) => void
  tableState: TableState
}

export const OrdersTableContext = React.createContext({} as CommonState)
