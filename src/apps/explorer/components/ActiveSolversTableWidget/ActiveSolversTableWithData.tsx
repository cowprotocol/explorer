import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import { ActiveSolversTableContext } from 'apps/explorer/components/ActiveSolversTableWidget/context/ActiveSolversTableContext'
import ActiveSolverTable from 'components/solver/ActiveSolverTable'
import { DEFAULT_TIMEOUT } from 'const'
import CowLoading from 'components/common/CowLoading'

export const ActiveSolversTableWithData: React.FC = () => {
  const { data: solvers, networkId, tableState } = useContext(ActiveSolversTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!solvers) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [solvers, solvers?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <ActiveSolverTable solvers={solvers} tableState={tableState} />
  )
}
