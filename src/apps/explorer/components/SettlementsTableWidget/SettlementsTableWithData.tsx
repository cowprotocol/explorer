import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import { SettlementsTableContext } from 'apps/explorer/components/SettlementsTableWidget/context/SettlementsTableContext'
import SettlementTable from 'components/solver/SettlementTable'
import { DEFAULT_TIMEOUT } from 'const'
import CowLoading from 'components/common/CowLoading'

export const SettlementsTableWithData: React.FC = () => {
  const { data: settlements, networkId, tableState } = useContext(SettlementsTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!settlements) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [settlements, settlements?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <SettlementTable settlements={settlements} tableState={tableState} />
  )
}
