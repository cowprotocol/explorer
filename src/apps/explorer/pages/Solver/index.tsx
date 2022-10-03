import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useQuery } from 'hooks/useQuery'
import { Solver as SolverType } from 'hooks/useGetSolvers'
import { TableState, useTable } from 'hooks/useTable'
import { useNetworkId } from 'state/network'
import { ActiveSolversTableContext } from 'apps/explorer/components/ActiveSolversTableWidget/context/ActiveSolversTableContext'
import { TableSearch } from 'components/common/TableSearch/TableSearch'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import ActiveSolversTableWidget from 'apps/explorer/components/ActiveSolversTableWidget'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'

import { StyledExplorerTabs, Wrapper, WrapperExtraComponents } from './styled'
import { UiError } from 'types'

export enum TabView {
  ACTIVE_SOLVERS = 1,
  SETTLEMENTS = 2,
}

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (
  networkId: SupportedChainId | undefined,
  query: string,
  setTableValues: (data: { data: unknown[]; length: number; isLoading: boolean; error?: UiError }) => void,
  data: unknown[],
  tableState: TableState,
): TabItemInterface[] => {
  return [
    {
      id: TabView.ACTIVE_SOLVERS,
      tab: <span>Active solvers</span>,
      content: (
        <ActiveSolversTableWidget
          query={query}
          data={data as SolverType[]}
          tableState={tableState}
          networkId={networkId}
          setTableValues={setTableValues}
        />
      ),
    },
    {
      id: TabView.SETTLEMENTS,
      tab: <span>Settlements</span>,
      content: <></>,
    },
  ]
}

const RESULTS_PER_PAGE = 10

const Solver: React.FC = () => {
  const history = useHistory()
  const { tab } = useQueryViewParams()
  const [tabViewSelected, setTabViewSelected] = useState<TabView>(TabView[tab] || TabView[DEFAULT_TAB]) // use DEFAULT when URL param is outside the enum
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const [tableValues, setTableValues] = useState<{
    data: Array<unknown>
    length: number
    isLoading: boolean
    error?: UiError
  }>({
    data: [],
    isLoading: false,
    length: 0,
    error: undefined,
  })
  const [query, setQuery] = useState<string>('')
  const networkId = useNetworkId() || undefined
  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < tableValues.length
  tableState['totalResults'] = tableValues.length

  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset, setQuery])

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < tableValues.length
  tableState['totalResults'] = tableValues.length

  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset, setQuery])

  const ExtraComponentNode: React.ReactNode = (
    <WrapperExtraComponents>
      <TableSearch placeholder="Search by solver, address or name" query={query} setQuery={setQuery} />
      <TablePagination context={ActiveSolversTableContext} />
    </WrapperExtraComponents>
  )

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < tableValues.length
  tableState['totalResults'] = tableValues.length

  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset, setQuery])

  const onChangeTab = useCallback((tabId: number) => {
    const newTabViewName = TabView[tabId]
    if (!newTabViewName) return
    setTabViewSelected(TabView[newTabViewName])
  }, [])

  useEffect(() => {
    history.replace({ search: `?tab=${TabView[tabViewSelected].toLowerCase()}` })
  }, [history, tabViewSelected])

  return (
    <Wrapper>
      <Title>Solvers</Title>
      <Content>
        <ActiveSolversTableContext.Provider
          value={{
            data: tableValues.data as SolverType[],
            error: tableValues.error,
            isLoading: tableValues.isLoading,
            networkId,
            tableState,
            setPageSize,
            setPageOffset,
            handleNextPage,
            handlePreviousPage,
          }}
        >
          <StyledExplorerTabs
            className={`solvers-tab--${TabView[tabViewSelected].toLowerCase()}`}
            tabItems={tabItems(networkId, query, setTableValues, tableValues.data, tableState)}
            defaultTab={tabViewSelected}
            onChange={(key: number): void => onChangeTab(key)}
            extra={ExtraComponentNode}
          />
        </ActiveSolversTableContext.Provider>
      </Content>
    </Wrapper>
  )
}

export default Solver
