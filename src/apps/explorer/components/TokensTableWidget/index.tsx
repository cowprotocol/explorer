import React, { useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import { useNetworkId } from 'state/network'
import { useGetTokens } from 'hooks/useGetTokens'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Token } from 'api/operator/types'
import { TokensTableWithData } from 'apps/explorer/components/TokensTableWidget/TokensTableWithData'
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

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  ${media.mobile} {
    justify-content: center;
  }
`

const TableWrapper = styled.div`
  margin-top: 5rem;
  max-width: 90vw;
`

const ExplorerCustomTab = styled(ExplorerTabs)`
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
    <TablePagination context={TokensTableContext} fixedResultsPerPage />
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
          Top tokens
          <TableSearch query={query} setQuery={setQuery} />
        </>
      ),
      content: <TokensTableWithData />,
    },
  ]
}

export const TokensTableWidget: React.FC<Props> = () => {
  const networkId = useNetworkId() || undefined
  const resultsPerPage = 5
  const [query, setQuery] = useState('')
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: resultsPerPage } })
  const { tokens, isLoading, error } = useGetTokens(networkId)
  const filteredTokens = useFlexSearch(query, tokens, ['name', 'symbol'])
  const resultsLength = query ? filteredTokens.length : tokens.length

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < resultsLength
  tableState['totalResults'] = resultsLength

  const filterData = (): Token[] => {
    const data = query ? (filteredTokens as Token[]) : tokens
    return data.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }

  if (!tokens?.length) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  return (
    <TableWrapper>
      <TokensTableContext.Provider
        value={{
          data: filterData(),
          error,
          isLoading,
          networkId,
          tableState,
          setPageSize,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <ConnectionStatus />
        <ExplorerCustomTab extraPosition={'bottom'} tabItems={tabItems(query, setQuery)} extra={ExtraComponentNode} />
      </TokensTableContext.Provider>
    </TableWrapper>
  )
}
