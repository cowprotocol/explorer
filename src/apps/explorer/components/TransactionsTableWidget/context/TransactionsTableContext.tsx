import React from 'react'

import { Network } from 'types'
import { Order } from 'api/operator'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  txHashParams: { networkId: BlockchainNetwork; txHash: string }
  error: string
  orders: Order[] | undefined
  isTxLoading: boolean
}

export const TransactionsTableContext = React.createContext({} as CommonState)
