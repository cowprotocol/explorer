import { useState } from 'react'

export interface TableState {
  pageSize: number
  pageIndex: number
}

export interface TableOptions {
  initialState: TableState
}

interface TableStateAndSetters {
  state: TableState
  setPageSize: (pageSize: number) => void
}

export function useTable(options: TableOptions): TableStateAndSetters {
  const {
    initialState: { pageSize: initialPageSize },
  } = options
  const [pageSize, setPageSize] = useState(initialPageSize)
  const pageIndex = 0
  const state: TableState = { pageSize, pageIndex }

  return { state, setPageSize }
}
