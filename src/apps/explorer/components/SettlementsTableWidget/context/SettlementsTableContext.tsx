import React from 'react'

import { Network, UiError } from 'types'
import { Settlement } from 'hooks/useGetSettlements'
import { TableState, TableStateSetters } from 'hooks/useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Settlement[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const SettlementsTableContext = React.createContext({} as CommonState)
