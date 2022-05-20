import React from 'react'
import styled from 'styled-components'

import { Order } from 'api/operator'

import { formatSmart, formatSmartMaxPrecision, safeTokenName } from 'utils'

import { LOW_PRECISION_DECIMALS, PERCENTAGE_PRECISION } from 'apps/explorer/const'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'

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

// const UsdAmount = styled.span`
//   color: ${({ theme }): string => theme.textPrimary1};
//   opacity: 0.5;
// `

export type Props = { order: Order; amountLikeTooltip?: boolean }

export function OrderSurplusDisplay(props: Props): JSX.Element | null {
  const {
    order: { kind, buyToken, sellToken, surplusAmount, surplusPercentage },
    amountLikeTooltip,
  } = props

  const surplusToken = kind === 'buy' ? sellToken : buyToken

  // TODO: get USD estimation
  // const usdAmount = '55.555'

  if (!surplusToken || surplusAmount.isZero()) {
    return null
  }

  const formattedSurplusPercentage = formatSmart({
    amount: surplusPercentage.toString(10),
    precision: PERCENTAGE_PRECISION,
    decimals: LOW_PRECISION_DECIMALS,
  })
  const formattedSurplusAmount = formatSmartMaxPrecision(surplusAmount, surplusToken)
  const tokenSymbol = safeTokenName(surplusToken)
  const amountText = `${formattedSurplusAmount} ${tokenSymbol}`
  const percentageText = `+${formattedSurplusPercentage}%`
  // const formattedUsdAmount = formatSmart({
  //   amount: usdAmount,
  //   precision: NO_ADJUSTMENT_NEEDED_PRECISION,
  //   decimals: LOW_PRECISION_DECIMALS,
  // })

  return (
    <Wrapper>
      {amountLikeTooltip ? (
        <TextWithTooltip textInTooltip={amountText}>
          <Surplus>{percentageText}</Surplus>
        </TextWithTooltip>
      ) : (
        <>
          <Surplus>{percentageText}</Surplus>
          <span>{amountText}</span>
        </>
      )}
      {/* <UsdAmount>(~${formattedUsdAmount})</UsdAmount> */}
    </Wrapper>
  )
}
