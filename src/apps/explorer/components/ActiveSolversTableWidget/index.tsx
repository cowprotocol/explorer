import React, { useEffect } from 'react'
import styled from 'styled-components'
import { ActiveSolversTableContext, BlockchainNetwork } from './context/ActiveSolversTableContext'
import { useNetworkId } from 'state/network'
import { useFlexSearch } from 'hooks/useFlexSearch'
import { Solver, useGetSolvers } from 'hooks/useGetSolvers'
import { ActiveSolversTableWithData } from 'apps/explorer/components/ActiveSolversTableWidget/ActiveSolversTableWithData'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { CardRow } from 'components/common/CardRow'
import TablePagination, { PaginationWrapper } from '../common/TablePagination'
import { TableState } from './useTable'
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
  data: Solver[]
  setTableValues: (data: unknown) => void
}

export const ActiveSolversTableWidget: React.FC<Props> = ({ query, tableState, setTableValues, data }) => {
  const networkId = useNetworkId() || undefined
  const { solvers, isLoading, error } = useGetSolvers(networkId, data)
  const filteredSolvers = useFlexSearch(query, solvers, ['name', 'address'])

  useEffect(() => {
    const response = query ? (filteredSolvers as Solver[]) : solvers
    setTableValues({
      data: response.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize),
      length: query ? filteredSolvers.length : solvers.length,
      isLoading,
      error,
    })
  }, [error, filteredSolvers, isLoading, query, setTableValues, solvers, tableState.pageOffset, tableState.pageSize])

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
      <ActiveSolversTableWithData />
      <TablePagination context={ActiveSolversTableContext} />
    </TableWrapper>
  )
}

export default ActiveSolversTableWidget
