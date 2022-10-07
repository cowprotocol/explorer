import React from 'react'

import { Network, UiError } from 'types'
import { Solver } from 'hooks/useGetSolvers'
import { TableState, TableStateSetters } from 'hooks/useTable'

export type BlockchainNetwork = Network | undefined

type CommonState = {
  error?: UiError
  data: Solver[] | undefined
  networkId: BlockchainNetwork
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const ActiveSolversTableContext = React.createContext({} as CommonState)
