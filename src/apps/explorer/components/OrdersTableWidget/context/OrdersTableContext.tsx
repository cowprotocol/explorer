import React from 'react'

import { Order } from 'api/operator'

interface CommonState {
  orders: Order[]
  error: string
  isFirstLoading: boolean
}

export const OrdersTableContext = React.createContext({} as CommonState)
