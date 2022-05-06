import React, { useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import Spinner from 'components/common/Spinner'
import { useNetworkId } from 'state/network'
import { useGetTokens } from 'hooks/useGetTokens'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Token } from 'api/operator/types'
import { TokensTableWithData } from 'apps/explorer/components/TokensTableWidget/TokensTableWithData'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import { StyledTabLoader } from 'apps/explorer/pages/styled'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { TabList } from 'components/common/Tabs/Tabs'
import { useTable } from './useTable'
import { TableSearch } from 'components/common/TableSearch/TableSearch'
import { media } from 'theme/styles/media'

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
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  ${TabList} > button {
    border-bottom: none;
    font-size: 1.8rem;
    ${media.mobile} {
      font-size: 1.5rem;
    }
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

const tabItems = (isLoadingTokens: boolean, query: string, setQuery: (query: string) => void): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Top Tokens
          <StyledTabLoader>{isLoadingTokens && <Spinner spin size="1x" />}</StyledTabLoader>
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
  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < tokens.length

  if (!tokens?.length) {
    return <Spinner spin size="3x" />
  }

  return (
    <TableWrapper>
      <TokensTableContext.Provider
        value={{
          data: query
            ? (filteredTokens as Token[])
            : tokens.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize),
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
        <ExplorerCustomTab tabItems={tabItems(isLoading, query, setQuery)} extra={ExtraComponentNode} />
      </TokensTableContext.Provider>
    </TableWrapper>
  )
}
