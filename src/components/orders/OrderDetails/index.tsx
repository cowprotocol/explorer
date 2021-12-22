import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Order, Trade } from 'api/operator'

import { DetailsTable } from 'components/orders/DetailsTable'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import RedirectToSearch from 'components/RedirectToSearch'

const TitleUid = styled(RowWithCopyButton)`
  color: ${({ theme }): string => theme.grey};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  margin: 0 0 0 1rem;
  display: flex;
  align-items: center;
`

export type Props = {
  order: Order | null
  trades: Trade[]
  isOrderLoading: boolean
  areTradesLoading: boolean
  errors: Record<string, string>
}

export const OrderDetails: React.FC<Props> = (props) => {
  const { order, isOrderLoading, areTradesLoading, errors, trades } = props
  const areTokensLoaded = order?.buyToken && order?.sellToken
  const isLoadingForTheFirstTime = isOrderLoading && !areTokensLoaded
  const [redirectTo, setRedirectTo] = useState(false)

  // Only set txHash for fillOrKill orders, if any
  // Partially fillable order will have a tab only for the trades
  const txHash = order && !order.partiallyFillable && trades && trades.length === 1 ? trades[0].txHash : undefined

  // Avoid redirecting until another network is searched again
  useEffect(() => {
    if (order || isOrderLoading) return

    const timer = setTimeout(() => {
      setRedirectTo(true)
    }, 500)

    return (): void => clearTimeout(timer)
  })

  if (redirectTo) {
    return <RedirectToSearch from="orders" />
  }

  return (
    <>
      <h1>
        {order && 'Order details'}
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />}
      </h1>
      {/* TODO: add tabs (overview/fills) */}
      {order && areTokensLoaded && <DetailsTable order={{ ...order, txHash }} areTradesLoading={areTradesLoading} />}
      {/* TODO: add fills tab for partiallyFillable orders */}
      {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
      {/* TODO: do a better error display. Toast notification maybe? */}
      {Object.keys(errors).map((key) => (
        <p key={key}>{errors[key]}</p>
      ))}
      {/* TODO: create common loading indicator */}
      {isLoadingForTheFirstTime && <FontAwesomeIcon icon={faSpinner} spin size="3x" />}
    </>
  )
}
