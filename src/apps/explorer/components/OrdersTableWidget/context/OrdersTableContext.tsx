import React from 'react'

import { Order } from 'api/operator'
import { TableState, TableStateSetters } from 'apps/explorer/components/OrdersTableWidget/useTable'

type CommonState = {
  orders: Order[]
  error: string
  isOrdersLoading: boolean
  tableState: TableState
} & TableStateSetters

export const OrdersTableContext = React.createContext({} as CommonState)
