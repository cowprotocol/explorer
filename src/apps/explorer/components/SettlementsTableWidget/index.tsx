import React, { useEffect } from 'react'
import styled from 'styled-components'
import { SettlementsTableContext, BlockchainNetwork } from './context/SettlementsTableContext'
import { useNetworkId } from 'state/network'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Settlement, useGetSettlements } from 'hooks/useGetSettlements'
import { TableState } from 'hooks/useTable'
import { SettlementsTableWithData } from 'apps/explorer/components/SettlementsTableWidget/SettlementsTableWithData'
import { TabView } from 'apps/explorer/pages/Solver'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { CardRow } from 'components/common/CardRow'
import TablePagination, { PaginationWrapper } from '../common/TablePagination'
import { DropdownDirection } from '../common/Dropdown'
import { media } from 'theme/styles/media'
import CowLoading from 'components/common/CowLoading'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { ScrollBarStyle } from 'apps/explorer/styled'

const TableWrapper = styled(CardRow)`
  width: 100%;
  ${media.mobile} {
    width: 100%;
  }
  ${PaginationWrapper} {
    width: 100%;
    justify-content: flex-end;
  }
  div.tab-content {
    padding: 0 !important;
    table {
      ${ScrollBarStyle}
    }
  }
`
interface Props {
  networkId: BlockchainNetwork
  query: string
  tableState: TableState
  data: Settlement[]
  setTableValues: (data: unknown) => void
}

export const SettlementsTableWidget: React.FC<Props> = ({ query, tableState, setTableValues, data }) => {
  const networkId = useNetworkId() || undefined
  const { settlements, isLoading, error } = useGetSettlements(networkId, data)
  const filteredSettlements = useFlexSearch(query, settlements, ['name', 'txHash'])

  useEffect(() => {
    const response = query ? (filteredSettlements as Settlement[]) : settlements
    setTableValues((prevState: unknown[]) => ({
      ...prevState,
      [TabView.SETTLEMENTS]: {
        data: response.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize),
        rawData: settlements,
        length: query ? filteredSettlements.length : settlements.length,
        isLoading,
        error,
      },
    }))
  }, [
    error,
    filteredSettlements,
    isLoading,
    query,
    setTableValues,
    settlements,
    tableState.pageOffset,
    tableState.pageSize,
  ])

  if (isLoading) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  return (
    <TableWrapper>
      <ConnectionStatus />
      <SettlementsTableWithData />
      <TablePagination dropdownDirection={DropdownDirection.upwards} context={SettlementsTableContext} />
    </TableWrapper>
  )
}

export default SettlementsTableWidget
