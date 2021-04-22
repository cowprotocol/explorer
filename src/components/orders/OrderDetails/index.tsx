import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Order, Trade } from 'api/operator'

import { DetailsTable } from 'components/orders/DetailsTable'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'

const Wrapper = styled.div`
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;
  max-width: 140rem;

  ${media.mediumDown} {
    max-width: 94rem;
  }

  ${media.mobile} {
    max-width: 100%;
  }

  > h1 {
    display: flex;
    padding: 2.4rem 0 0.75rem;
    align-items: center;
    font-weight: ${({ theme }): string => theme.fontBold};
  }
`

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

  // Only set txHash for fillOrKill orders, if any
  // Partially fillable order will have a tab only for the trades
  const txHash = order && !order.partiallyFillable && trades && trades.length === 1 ? trades[0].txHash : undefined

  return (
    <Wrapper>
      <h1>
        Order details
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />}
      </h1>
      {/* TODO: add tabs (overview/fills) */}
      {order && areTokensLoaded && <DetailsTable order={{ ...order, txHash }} areTradesLoading={areTradesLoading} />}
      {/* TODO: add fills tab for partiallyFillable orders */}
      {!order && !isOrderLoading && <p>Order not found</p>}
      {!isOrderLoading && order && !areTokensLoaded && <p>Not able to load tokens</p>}
      {/* TODO: do a better error display. Toast notification maybe? */}
      {Object.keys(errors).map((key) => (
        <p key={key}>{errors[key]}</p>
      ))}
      {/* TODO: create common loading indicator */}
      {isLoadingForTheFirstTime && <FontAwesomeIcon icon={faSpinner} spin size="3x" />}
    </Wrapper>
  )
}
