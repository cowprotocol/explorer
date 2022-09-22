import React from 'react'

import { Network, UiError } from 'types'
import { TableState, TableStateSetters } from '../useTable'
import { Solver } from 'hooks/useGetSolvers'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Solver[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const ActiveSolversTableContext = React.createContext({} as CommonState)
