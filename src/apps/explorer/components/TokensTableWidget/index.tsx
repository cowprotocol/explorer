import React, { useEffect, useState } from 'react'
import { Index } from 'flexsearch'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import Spinner from 'components/common/Spinner'
import { Wrapper, Input, SearchIcon } from 'apps/explorer/components/common/Search/Search.styled'

import { useNetworkId } from 'state/network'
import { useGetTokens } from 'hooks/useGetTokens'
import { TokensTableWithData } from 'apps/explorer/components/TokensTableWidget/TokensTableWithData'
import { TabItemInterface } from 'components/common/Tabs/Tabs'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTab'
import { StyledTabLoader } from 'apps/explorer/pages/styled'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { TabList } from 'components/common/Tabs/Tabs'
import PaginationTokensTable from './PaginationTokensTable'
import { useTable } from './useTable'

// assets
import searchImg from 'assets/img/search2.svg'

const SEARCH_INDEX = new Index({
  tokenize: 'forward',
})

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  ${TabList} > button {
    border-bottom: none;
    font-size: large;
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

interface SearchProps {
  query: string
  setQuery: (query: string) => void
}

const SearchWrapped = styled(Wrapper)`
  margin-left: 10px;
  max-width: 400px;
  ${SearchIcon} {
    width: 20px;
    position: absolute;
    left: 20px;
  }
  ${Input} {
    height: 4rem;
    font-size: 1.5rem;
  }
`

const FlexSearchComponent: React.FC<SearchProps> = ({ query, setQuery }) => (
  <SearchWrapped>
    <SearchIcon src={searchImg} />
    <Input
      autoComplete="off"
      type="search"
      name="query"
      value={query}
      onChange={(e): void => setQuery(e.target.value.trim())}
      placeholder={'Search token by name, symbol or hash'}
      aria-label="Search token by name, symbol or hash"
    />
  </SearchWrapped>
)

const tabItems = (isLoadingTokens: boolean, query: string, setQuery: (query: string) => void): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Top Tokens
          <StyledTabLoader>{isLoadingTokens && <Spinner spin size="1x" />}</StyledTabLoader>
          <FlexSearchComponent query={query} setQuery={setQuery} />
        </>
      ),
      content: <TokensTableWithData />,
    },
  ]
}

export const TokensTableWidget: React.FC<Props> = () => {
  const networkId = useNetworkId() || undefined
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(SEARCH_INDEX)
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: 20 } })
  const { tokens, isLoading: isTokensLoading, error } = useGetTokens(networkId)
  const [filteredTokens, setFilteredTokens] = useState(tokens)

  useEffect(() => {
    tokens?.forEach((token) => {
      index.add(token.id, JSON.stringify(token))
    })
  }, [index, tokens])

  useEffect(() => {
    const result = index.search(query)
    const filteredTokens = tokens?.filter((token) => result.includes(token.id))
    setFilteredTokens(filteredTokens)
    searchAndLog(query, index)
  }, [index, query, tokens])

  useEffect(() => {
    setIndex(SEARCH_INDEX)
    setFilteredTokens(tokens)
  }, [tokens])

  if (!tokens?.length) {
    return <Spinner spin size="3x" />
  }

  return (
    <>
      <TokensTableContext.Provider
        value={{
          tokens: query ? filteredTokens : tokens,
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
        <ExplorerCustomTab
          className="matu"
          tabItems={tabItems(isTokensLoading, query, setQuery)}
          extra={ExtraComponentNode}
        />
      </TokensTableContext.Provider>
    </>
  )
}

const searchAndLog = (keyword: string, flexsearch: Index): void => {
  const result = flexsearch.search(keyword)

  console.log(`Searching result of ${keyword}:\t`, result)
}
