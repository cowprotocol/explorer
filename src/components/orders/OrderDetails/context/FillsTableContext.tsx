import React from 'react'
import { Trade } from 'api/operator'
import { TableState, TableStateSetters } from 'apps/explorer/components/TokensTableWidget/useTable'

type CommonState = {
  trades: Trade[]
  isPriceInverted: boolean
  invertPrice: () => void
  isLoading: boolean
  tableState: TableState
} & TableStateSetters

export const FillsTableContext = React.createContext({} as CommonState)
