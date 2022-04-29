import React, { useContext, useState, useEffect } from 'react'

import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useFirstRender from 'hooks/useFirstRender'
import Spinner from 'components/common/Spinner'
import { TokensTableContext } from 'apps/explorer/components/TokensTableWidget/context/TokensTableContext'
import TokenTable from 'components/token/TokenTable'
import { DEFAULT_TIMEOUT } from 'const'

export const TokensTableWithData: React.FC = () => {
  const { tokens, networkId } = useContext(TokensTableContext)
  const isFirstRender = useFirstRender()
  const [isFirstLoading, setIsFirstLoading] = useState(true)

  useEffect(() => {
    setIsFirstLoading(true)
  }, [networkId])

  useEffect(() => {
    let timeOutMs = 0
    if (!tokens) {
      timeOutMs = DEFAULT_TIMEOUT
    }

    const timeOutId: NodeJS.Timeout = setTimeout(() => {
      setIsFirstLoading(false)
    }, timeOutMs)

    return (): void => {
      clearTimeout(timeOutId)
    }
  }, [tokens, tokens?.length])

  return isFirstRender || isFirstLoading ? (
    <EmptyItemWrapper>
      <Spinner spin size="3x" />
    </EmptyItemWrapper>
  ) : (
    <TokenTable tokens={tokens} />
  )
}
