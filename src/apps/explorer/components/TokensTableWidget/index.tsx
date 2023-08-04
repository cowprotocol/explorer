import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import { useNetworkId } from 'state/network'
import { Token, useGetTokens } from 'hooks/useGetTokens'
import { Batch, useGetBatches } from 'hooks/useGetBatches'

import { useFlexSearch } from 'hooks/useFlexSearch'
import { TokensTableWithData } from 'apps/explorer/components/TokensTableWidget/TokensTableWithData'
import { BatchesTableWithData } from 'apps/explorer/components/TokensTableWidget/BatchesTableWithData'
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
import { useHistory, useLocation } from 'react-router-dom'

const TABS = {
  TOKENS: 1,
  BATCHES: 2,
}
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
    padding: 1.4rem 0;
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

interface Props {
  networkId: BlockchainNetwork
}

const tabItems = (): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: <>Top tokens</>,
      content: <TokensTableWithData />,
    },
    {
      id: 2,
      tab: <>Recent batches</>,
      content: <BatchesTableWithData />,
    },
  ]
}

const RESULTS_PER_PAGE = 10

export const TokensTableWidget: React.FC<Props> = () => {
  const history = useHistory()
  const location = useLocation()
  const networkId = useNetworkId() || undefined
  const [query, setQuery] = useState('')

  const [selectedTab, setSelectedTab] = useState(location.hash === '#batches' ? TABS.BATCHES : TABS.TOKENS)
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const { tokens, isLoading: isTokensLoading, error: tokensError } = useGetTokens(networkId)
  const { batches, isLoading: isLoadingBatches, error: errorBatches } = useGetBatches(networkId)

  const isLoading = isTokensLoading || isLoadingBatches
  const error = tokensError || errorBatches

  const filteredBatches = useFlexSearch(query, batches, ['id', 'txHash'])
  const filteredTokens = useFlexSearch(query, tokens, ['name', 'symbol', 'address'])
  const resultsLength = query.length ? filteredTokens.length : tokens.length

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

  useEffect(() => {
    const handleHashChange = (): void => {
      setSelectedTab(location.hash === '#batches' ? TABS.BATCHES : TABS.TOKENS)
    }
    window.addEventListener('hashchange', handleHashChange)
    return (): void => window.removeEventListener('hashchange', handleHashChange)
  }, [location.hash])

  const filterData = (): Token[] => {
    const data = query ? (filteredTokens as Token[]) : tokens

    return data
      .map((token) => ({
        ...token,
        lastDayPricePercentageDifference: token.lastDayPricePercentageDifference ?? null,
        lastWeekPricePercentageDifference: token.lastWeekPricePercentageDifference ?? null,
        lastDayUsdVolume: token.lastDayUsdVolume ?? null,
        lastWeekUsdPrices:
          token.lastWeekUsdPrices && token.lastWeekUsdPrices.length > 6 ? token.lastWeekUsdPrices : null,
      }))
      .slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }
  const filterBatches = (): Batch[] => {
    const data = query ? (filteredBatches as Batch[]) : batches
    return data.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }

  if (!tokens?.length) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }
  const ExtraComponentNodeSearchBar: React.ReactNode = (
    <div style={{ marginRight: '1rem' }}>
      <WrapperExtraComponents>
        <TableSearch query={query} setQuery={setQuery} />
      </WrapperExtraComponents>
    </div>
  )
  return (
    <TableWrapper>
      <TokensTableContext.Provider
        value={{
          data: filterData(),
          batchesData: filterBatches(),
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
        <ExplorerCustomTab
          extraPosition={'bottom'}
          tabItems={tabItems()}
          updateSelectedTab={(tabId: number): void => {
            setSelectedTab(tabId)
            history.push(tabId === TABS.BATCHES ? '#batches' : '#tokens')
          }}
          extra={ExtraComponentNode}
          searchBar={ExtraComponentNodeSearchBar}
          selectedTab={selectedTab}
        />
      </TokensTableContext.Provider>
    </TableWrapper>
  )
}
