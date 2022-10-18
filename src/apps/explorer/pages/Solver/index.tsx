import React, { useCallback, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useQuery } from 'hooks/useQuery'
import { Solver as SolverType } from 'hooks/useGetSolvers'
import { Settlement as SettlementType } from 'hooks/useGetSettlements'
import { TableState, useTable } from 'hooks/useTable'
import { useNetworkId } from 'state/network'
import { ActiveSolversTableContext } from 'apps/explorer/components/ActiveSolversTableWidget/context/ActiveSolversTableContext'
import { SettlementsTableContext } from 'apps/explorer/components/SettlementsTableWidget/context/SettlementsTableContext'
import { TableSearch } from 'components/common/TableSearch/TableSearch'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import ActiveSolversTableWidget from 'apps/explorer/components/ActiveSolversTableWidget'
import SettlementsTableWidget from 'apps/explorer/components/SettlementsTableWidget'
import { TabItemInterface } from 'components/common/Tabs/Tabs'

import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'

import { StyledExplorerTabs, Wrapper, WrapperExtraComponents } from './styled'
import { UiError } from 'types'

export enum TabView {
  ACTIVE_SOLVERS = 1,
  SETTLEMENTS = 2,
}

const DEFAULT_TABLE_INFO: { data: unknown[]; rawData: unknown[]; isLoading: boolean; length: number; error?: UiError } =
  {
    data: [],
    rawData: [],
    isLoading: false,
    length: 0,
    error: undefined,
  }

const DEFAULT_TAB = TabView[1]

function useQueryViewParams(): { tab: string } {
  const query = useQuery()
  return { tab: query.get('tab')?.toUpperCase() || DEFAULT_TAB } // if URL param empty will be used DEFAULT
}

const tabItems = (
  networkId: SupportedChainId | undefined,
  query: string,
  setTableValues: (data: unknown) => void,
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
      content: (
        <SettlementsTableWidget
          query={query}
          data={data as SettlementType[]}
          tableState={tableState}
          networkId={networkId}
          setTableValues={setTableValues}
        />
      ),
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
  const [tableValues, setTableValues] = useState({
    [TabView.ACTIVE_SOLVERS]: DEFAULT_TABLE_INFO,
    [TabView.SETTLEMENTS]: DEFAULT_TABLE_INFO,
  })
  const [query, setQuery] = useState<string>('')
  const networkId = useNetworkId() || undefined
  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < tableValues[tabViewSelected].length
  tableState['totalResults'] = tableValues[tabViewSelected].length

  const TableContext = tabViewSelected === TabView.ACTIVE_SOLVERS ? ActiveSolversTableContext : SettlementsTableContext
  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset, setQuery, tabViewSelected])

  const ExtraComponentNode: React.ReactNode = (
    <WrapperExtraComponents>
      <TableSearch placeholder="Search by solver, address or name" query={query} setQuery={setQuery} />
      <TablePagination context={TableContext} />
    </WrapperExtraComponents>
  )

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
        <TableContext.Provider
          value={{
            data: tableValues[tabViewSelected].data as any[],
            error: tableValues[tabViewSelected].error,
            isLoading: tableValues[tabViewSelected].isLoading,
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
            tabItems={tabItems(networkId, query, setTableValues, tableValues[tabViewSelected].rawData, tableState)}
            defaultTab={tabViewSelected}
            onChange={(key: number): void => onChangeTab(key)}
            extra={ExtraComponentNode}
          />
        </TableContext.Provider>
      </Content>
    </Wrapper>
  )
}

export default Solver
