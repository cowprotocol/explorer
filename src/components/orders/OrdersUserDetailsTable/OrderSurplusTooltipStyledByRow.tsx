import React from 'react'
import styled from 'styled-components'

import { media } from 'theme/styles/media'
import { Order } from 'api/operator'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { OrderSurplusTooltipDisplay, OrderSurplusDisplay } from '../OrderSurplusDisplay'

export const OrderSurplusDisplayStyled = styled(OrderSurplusDisplay)`
  ${media.mobile} {
    flex-direction: column;
  }
`
/**
 * Displays surplus amount inside tooltip when display mode has little space to display
 */
export function OrderSurplusDisplayStyledByRow({ order }: { order: Order }): JSX.Element {
  const isDesktop = useMediaBreakpoint(['xl', 'lg'])

  if (isDesktop) {
    return <OrderSurplusTooltipDisplay order={order} />
  }

  return <OrderSurplusDisplayStyled order={order} amountSmartFormatting />
}
