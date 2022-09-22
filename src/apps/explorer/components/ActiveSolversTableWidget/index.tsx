import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, ActiveSolversTableContext } from './context/ActiveSolversTableContext'
import { useNetworkId } from 'state/network'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Solver, useGetSolvers } from 'hooks/useGetSolvers'
import { ActiveSolversTableWithData } from 'apps/explorer/components/ActiveSolversTableWidget/ActiveSolversTableWithData'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { TabList } from 'components/common/Tabs/Tabs'
import { useTable } from './useTable'
import { TableSearch } from 'components/common/TableSearch/TableSearch'
import { media } from 'theme/styles/media'
import CowLoading from 'components/common/CowLoading'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { ScrollBarStyle } from 'apps/explorer/styled'
import { CardRow } from 'components/common/CardRow'

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  ${media.mobile} {
    justify-content: center;
  }
`

const TableWrapper = styled(CardRow)`
  width: 100%;
  ${media.mobile} {
    width: 100%;
  }
  div.tab-content {
    padding: 0 !important;
    table {
      ${ScrollBarStyle}
    }
  }
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  border: 0;
  ${TabList} {
    ${media.mobile} {
      flex-direction: column;
      border-bottom: none;
    }
  }
  ${TabList} > button {
    border-bottom: none;
    font-size: 1.8rem;
    margin: 0 0.5rem 0 1rem;
    ${media.mobile} {
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }
  .tab-extra-content {
    justify-content: center;
  }
`

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
    <TablePagination context={ActiveSolversTableContext} />
  </WrapperExtraComponents>
)

interface Props {
  networkId: BlockchainNetwork
}

const tabItems = (query: string, setQuery: (query: string) => void): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Active Solvers
          <TableSearch placeholder="Search by solver, address or name" query={query} setQuery={setQuery} />
        </>
      ),
      content: <ActiveSolversTableWithData />,
    },
  ]
}

const RESULTS_PER_PAGE = 10

export const ActiveSolversTableWidget: React.FC<Props> = () => {
  const networkId = useNetworkId() || undefined
  const [query, setQuery] = useState('')
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const { solvers, isLoading, error } = useGetSolvers(networkId)
  const filteredSolvers = useFlexSearch(query, solvers, ['name', 'address'])
  const resultsLength = query.length ? filteredSolvers.length : solvers.length

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < resultsLength
  tableState['totalResults'] = resultsLength

  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset])

  const filterData = (): Solver[] => {
    const data = query ? (filteredSolvers as Solver[]) : solvers

    return data.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }

  if (!solvers?.length) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  return (
    <TableWrapper>
      <ActiveSolversTableContext.Provider
        value={{
          data: filterData(),
          error,
          isLoading,
          networkId,
          tableState,
          setPageSize,
          setPageOffset,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <ConnectionStatus />
        <ExplorerCustomTab tabItems={tabItems(query, setQuery)} extra={ExtraComponentNode} />
      </ActiveSolversTableContext.Provider>
    </TableWrapper>
  )
}

export default ActiveSolversTableWidget
