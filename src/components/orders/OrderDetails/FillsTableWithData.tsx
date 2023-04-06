import React, { useContext } from 'react'

import { Order } from 'api/operator'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { FillsTableContext } from './context/FillsTableContext'

import useFirstRender from 'hooks/useFirstRender'
import CowLoading from 'components/common/CowLoading'
import FillsTable from './FillsTable'

export const FillsTableWithData: React.FC<{ areTokensLoaded: boolean; order: Order | null }> = ({
  areTokensLoaded,
  order,
}) => {
  const { trades, tableState } = useContext(FillsTableContext)
  const isFirstRender = useFirstRender()

  return isFirstRender || !areTokensLoaded ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <FillsTable order={order} trades={trades} tableState={tableState} />
  )
}
