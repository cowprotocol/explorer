import React from 'react'
import styled from 'styled-components'

import { Order } from 'api/operator'

import { formatSmart, formatSmartMaxPrecision, safeTokenName } from 'utils'

import { LOW_PRECISION_DECIMALS, PERCENTAGE_PRECISION } from 'apps/explorer/const'
import { Tooltip } from 'components/Tooltip'
import { usePopperOnClick } from 'hooks/usePopper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp as faIcon } from '@fortawesome/free-regular-svg-icons'

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

export type Props = { order: Order; amountLikeTooltip?: boolean }
type SurplusText = { amount: string; percentage: string }

function useGetSurplus(props: Props): SurplusText {
  const {
    order: { kind, buyToken, sellToken, surplusAmount, surplusPercentage },
  } = props

  const surplusToken = kind === 'buy' ? sellToken : buyToken

  // TODO: get USD estimation
  // const usdAmount = '55.555'

  if (!surplusToken || surplusAmount.isZero()) {
    return {} as SurplusText
  }

  const formattedSurplusPercentage = formatSmart({
    amount: surplusPercentage.toString(10),
    precision: PERCENTAGE_PRECISION,
    decimals: LOW_PRECISION_DECIMALS,
  })
  const formattedSurplusAmount = formatSmartMaxPrecision(surplusAmount, surplusToken)
  const tokenSymbol = safeTokenName(surplusToken)
  // const formattedUsdAmount = formatSmart({
  //   amount: usdAmount,
  //   precision: NO_ADJUSTMENT_NEEDED_PRECISION,
  //   decimals: LOW_PRECISION_DECIMALS,
  // })

  return {
    amount: `${formattedSurplusAmount} ${tokenSymbol}`,
    percentage: `+${formattedSurplusPercentage}%`,
  }
}

export function OrderSurplusDisplay(props: Props): JSX.Element | null {
  const { amount, percentage } = useGetSurplus(props)

  if (amount === undefined || percentage === undefined) return null

  return (
    <Wrapper>
      <Surplus>{percentage}</Surplus>
      <span>{amount}</span>
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

export function OrderSurplusTooltipDisplay(props: Props): JSX.Element | null {
  const { amount, percentage } = useGetSurplus(props)
  const tooltipPlacement = 'top'
  const { tooltipProps, targetProps } = usePopperOnClick<HTMLInputElement>(tooltipPlacement)

  if (amount === undefined || percentage === undefined) return null

  return (
    <span className="wrap-datedisplay">
      <Tooltip {...tooltipProps}>{amount}</Tooltip>
      <Wrapper>
        <span {...targetProps}>
          <IconWrapper icon={faIcon} />
          <Surplus>{percentage}</Surplus>
        </span>
        {/* <UsdAmount>(~${formattedUsdAmount})</UsdAmount> */}
      </Wrapper>
    </span>
  )
}
