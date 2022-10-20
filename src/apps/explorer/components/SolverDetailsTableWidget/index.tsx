import React from 'react'
import styled from 'styled-components'
import { Network, UiError } from 'types'
import TablePagination from 'apps/explorer/components/common/TablePagination'
import { SolverDetailsTableWithData } from './SolverDetailsTableWithData'
import { SettlementsTableContext } from '../SettlementsTableWidget/context/SettlementsTableContext'
import { useTable } from 'hooks/useTable'
import { Settlement } from 'hooks/useGetSettlements'
import { ConnectionStatus } from 'components/ConnectionStatus'
import { Notification } from 'components/Notification'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import CowLoading from 'components/common/CowLoading'

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`
const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`

type Props = {
  settlements: Settlement[]
  isLoading: boolean
  error: UiError | undefined
  networkId: Network | undefined
}

const SolverDetailsTableWidget: React.FC<Props> = ({ settlements, isLoading, error, networkId }) => {
  const {
    state: tableState,
    setPageSize,
    handleNextPage,
    setPageOffset,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: 20 } })

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < settlements.length
  tableState['totalResults'] = settlements.length

  return (
    <SettlementsTableContext.Provider
      value={{
        data: settlements.slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize),
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
      {error && <Notification type={error.type} message={error.message} />}
      <Wrapper>
        <TableHeader>
          <h2>Settlements</h2>
          <TablePagination context={SettlementsTableContext} />
        </TableHeader>
        {isLoading ? (
          <EmptyItemWrapper>
            <CowLoading />
          </EmptyItemWrapper>
        ) : (
          <SolverDetailsTableWithData />
        )}
      </Wrapper>
    </SettlementsTableContext.Provider>
  )
}

export default SolverDetailsTableWidget
