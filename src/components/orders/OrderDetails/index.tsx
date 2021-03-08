import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Order } from 'api/operator'

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
  isLoading: boolean
  errors: Record<string, string>
}

export const OrderDetails: React.FC<Props> = (props) => {
  const { order, isLoading, errors } = props

  return (
    <Wrapper>
      <h1>
        Order details
        {order && <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />}
      </h1>
      {/* TODO: add tabs (overview/fills) */}
      {order?.buyToken && order?.sellToken && <DetailsTable order={order} />}
      {/* TODO: add fills tab for partiallyFillable orders */}
      {!order && !isLoading && <p>Order not found</p>}
      {!isLoading && order && (!order?.buyToken || !order?.sellToken) && <p>Not able to load tokens</p>}
      {/* TODO: do a better error display. Toast notification maybe? */}
      {Object.keys(errors).map((key) => (
        <p key={key}>{errors[key]}</p>
      ))}
      {/* TODO: create common loading indicator */}
      {isLoading && (!order?.buyToken || !order?.sellToken) && <FontAwesomeIcon icon={faSpinner} spin size="3x" />}
    </Wrapper>
  )
}
