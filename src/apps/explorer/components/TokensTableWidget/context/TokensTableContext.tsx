import React from 'react'

import { Network, UiError } from 'types'
import { TableState, TableStateSetters } from '../useTable'
import { Token } from 'hooks/useGetTokens'
import { Batch } from 'hooks/useGetBatches'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Token[] | undefined
  batchesData: Batch[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const TokensTableContext = React.createContext({} as CommonState)
