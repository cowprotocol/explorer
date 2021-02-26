import React from 'react'
import styled from 'styled-components'

import { Order } from 'api/operator'

import { formatSmart, safeTokenName } from 'utils'
import {
  HIGH_PRECISION_DECIMALS,
  HIGH_PRECISION_SMALL_LIMIT,
  LOW_PRECISION_DECIMALS,
  NO_ADJUSTMENT_NEEDED_PRECISION,
  PERCENTAGE_PRECISION,
} from 'apps/explorer/const'

const Wrapper = styled.div`
  & > * {
    margin-right: 0.25rem;
  }

  & > :last-child {
    margin-right: 0;
  }
`

const Surplus = styled.span`
  color: ${({ theme }): string => theme.green};
`

const UsdAmount = styled.span`
  color: ${({ theme }): string => theme.textPrimary1};
  opacity: 0.5;
`

export type Props = { order: Order }

export function OrderSurplusDisplay(props: Props): JSX.Element | null {
  const {
    order: { kind, buyToken, sellToken, surplusAmount, surplusPercentage },
  } = props

  const surplusToken = kind === 'buy' ? sellToken : buyToken

  // TODO: get USD estimation
  const usdAmount = '55.555'

  if (!surplusToken || surplusAmount.isZero()) {
    return null
  }

  const formattedSurplusPercentage = formatSmart({
    amount: surplusPercentage.toString(10),
    precision: PERCENTAGE_PRECISION,
    decimals: LOW_PRECISION_DECIMALS,
  })
  const formattedSurplusAmount = formatSmart({
    amount: surplusAmount.toString(10),
    precision: surplusToken.decimals,
    decimals: HIGH_PRECISION_DECIMALS,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
  })
  const tokenSymbol = safeTokenName(surplusToken)
  const formattedUsdAmount = formatSmart({
    amount: usdAmount,
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    decimals: LOW_PRECISION_DECIMALS,
  })

  return (
    <Wrapper>
      <Surplus>+{formattedSurplusPercentage}%</Surplus>
      <span>
        {formattedSurplusAmount} {tokenSymbol}
      </span>
      <UsdAmount>(~${formattedUsdAmount})</UsdAmount>
    </Wrapper>
  )
}
