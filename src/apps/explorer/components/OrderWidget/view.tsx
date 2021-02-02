import React from 'react'
import styled from 'styled-components'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { RawOrder } from 'api/operator'

import { OrderDetails } from './OrderDetails'

const Wrapper = styled.div`
  padding: 4rem 3rem;
`

export type Props = {
  order: RawOrder | null
  isLoading: boolean
  error?: string
}

export const OrderWidgetView: React.FC<Props> = (props) => {
  const { order, isLoading, error } = props

  return (
    <Wrapper>
      <h2>Order details</h2>
      {/* TODO: create common loading indicator */}
      {isLoading && <FontAwesomeIcon icon={faSpinner} spin size="5x" />}
      {order && !isLoading && <OrderDetails order={order} />}
      {!order && !isLoading && <p>Order not found</p>}
      <h2>Order fills</h2>
      {/* TODO: implement fills component */}
      <p>No fills</p>
      {/* TODO: do a better error display. Toast notification maybe? */}
      {error && <p>{error}</p>}
    </Wrapper>
  )
}
