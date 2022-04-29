import React from 'react'

import { Network, UiError } from 'types'
import { Token } from 'api/operator'
import { TableState, TableStateSetters } from '../useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  tokens: Token[] | undefined
  networkId: BlockchainNetwork
  isTokensLoading: boolean
  tableState: TableState
} & TableStateSetters

export const TokensTableContext = React.createContext({} as CommonState)
