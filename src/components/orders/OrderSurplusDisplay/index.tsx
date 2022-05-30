import React from 'react'
import styled, { useTheme } from 'styled-components'

import { Order } from 'api/operator'

import {
  formatSmart,
  formatSmartMaxPrecision,
  safeTokenName,
  formattingAmountPrecision,
  FormatAmountPrecision,
} from 'utils'

import { LOW_PRECISION_DECIMALS, PERCENTAGE_PRECISION } from 'apps/explorer/const'
import { BaseIconTooltipOnHover } from 'components/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleUp as faIcon } from '@fortawesome/free-regular-svg-icons'

const Wrapper = styled.div`
  display: flex;
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

export type Props = { order: Order; amountSmartFormatting?: boolean } & React.HTMLAttributes<HTMLDivElement>
type SurplusText = { amount: string; percentage: string; amountSmartFormatting: string }

function useGetSurplus(order: Order): SurplusText | null {
  const { kind, buyToken, sellToken, surplusAmount, surplusPercentage } = order

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
  const formattedSurplusAmountMaxPrecision = formatSmartMaxPrecision(surplusAmount, surplusToken)
  const formattedSurplusAmount = formattingAmountPrecision(
    surplusAmount,
    surplusToken,
    FormatAmountPrecision.highPrecision,
  )

  const tokenSymbol = safeTokenName(surplusToken)
  // const formattedUsdAmount = formatSmart({
  //   amount: usdAmount,
  //   precision: NO_ADJUSTMENT_NEEDED_PRECISION,
  //   decimals: LOW_PRECISION_DECIMALS,
  // })

  return {
    amount: `${formattedSurplusAmountMaxPrecision} ${tokenSymbol}`,
    amountSmartFormatting: `${formattedSurplusAmount} ${tokenSymbol}`,
    percentage: `+${formattedSurplusPercentage}%`,
  }
}

export function OrderSurplusDisplay(props: Props): JSX.Element | null {
  const surplus = useGetSurplus(props.order)

  if (!surplus) return null

  return (
    <Wrapper className={props.className}>
      <Surplus>{surplus.percentage}</Surplus>
      <span>{props.amountSmartFormatting ? surplus.amountSmartFormatting : surplus.amount}</span>
      {/* <UsdAmount>(~${formattedUsdAmount})</UsdAmount> */}
    </Wrapper>
  )
}

const IconWrapper = styled(FontAwesomeIcon)`
  padding: 0.6rem;
  margin: -0.6rem 0 -0.6rem -0.6rem;
  box-sizing: content-box;

  :hover {
    cursor: pointer;
  }
`

export function OrderSurplusTooltipDisplay({ order }: Props): JSX.Element | null {
  const surplus = useGetSurplus(order)
  const theme = useTheme()

  if (!surplus) return null

  return (
    <BaseIconTooltipOnHover
      tooltip={surplus.amount}
      targetContent={
        <span>
          <IconWrapper icon={faIcon} color={theme.green} />
          <Surplus>{surplus.percentage}</Surplus>
        </span>
      }
    />
  )
}
