import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import { TokensTableContext } from 'apps/explorer/components/TokensTableWidget/context/TokensTableContext'
import BatchesTable from 'components/batches/BatchesTable'
import { DEFAULT_TIMEOUT } from 'const'
import CowLoading from 'components/common/CowLoading'

export const BatchesTableWithData: React.FC = () => {
  const { batchesData: batches, networkId, tableState } = useContext(TokensTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!batches) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [batches, batches?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <CowLoading />
    </EmptyItemWrapper>
  ) : (
    <BatchesTable batches={batches} tableState={tableState} />
  )
}
