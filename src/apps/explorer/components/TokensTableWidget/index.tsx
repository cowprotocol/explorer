import React, { useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import { useNetworkId } from 'state/network'
import { useGetTokens } from 'hooks/useGetTokens'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Token } from 'api/operator/types'
import { TokensTableWithData } from 'apps/explorer/components/TokensTableWidget/TokensTableWithData'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { TabList } from 'components/common/Tabs/Tabs'
import PaginationTokensTable from './PaginationTokensTable'
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
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  ${TabList} > button {
    border-bottom: none;
    font-size: 1.8rem;
    ${media.mobile} {
      font-size: 1.5rem;
      display: flex;
      flex-direction: column;
    }
  }
`

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
    <PaginationTokensTable />
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
  const [query, setQuery] = useState('')
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: 20 } })
  const { tokens, isLoading: isTokensLoading, error } = useGetTokens(networkId)
  const filteredTokens = useFlexSearch(query, tokens, ['name', 'symbol'])

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
          tokens: query ? (filteredTokens as Token[]) : tokens,
          error,
          isTokensLoading,
          networkId,
          tableState,
          setPageSize,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <ConnectionStatus />
        <ExplorerCustomTab tabItems={tabItems(query, setQuery)} extra={ExtraComponentNode} />
      </TokensTableContext.Provider>
    </TableWrapper>
  )
}
