import React from 'react'

import { Network, UiError } from 'types'
import { Token } from 'hooks/useGetTokens'
import { TableState, TableStateSetters } from 'hooks/useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Token[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const TokensTableContext = React.createContext({} as CommonState)
