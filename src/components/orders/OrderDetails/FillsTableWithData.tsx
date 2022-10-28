import React, { useContext, useState, useEffect } from 'react'

import { DEFAULT_TIMEOUT } from 'const'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { FillsTableContext } from './context/FillsTableContext'

import useFirstRender from 'hooks/useFirstRender'
import CowLoading from 'components/common/CowLoading'
import FillsTable from './FillsTable'

export const FillsTableWithData: React.FC<{ areTokensLoaded: boolean }> = ({ areTokensLoaded }) => {
  const { trades, isLoading, tableState } = useContext(FillsTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [isLoading])

  useEffect(() => {
    let timeOutMs = 0
    if (!trades) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [trades, trades?.length])

  return isFirstRender || isFirstLoading || !areTokensLoaded ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <FillsTable trades={trades} tableState={tableState} />
  )
}
