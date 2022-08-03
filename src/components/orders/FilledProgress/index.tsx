import React from 'react'
import styled from 'styled-components'

import { media } from 'theme/styles/media'

import { Order } from 'api/operator'

import { formatSmartMaxPrecision, safeTokenName } from 'utils'

import { ProgressBar } from 'components/common/ProgressBar'

export type Props = {
  order: Order
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }): string => theme.textPrimary1};

  > span {
    margin: 0 0 0 2rem;
    font-weight: ${({ theme }): string => theme.fontLighter};

    ${media.mobile} {
      line-height: 1.5;
    }
  }

  > span > b {
    font-weight: ${({ theme }): string => theme.fontMedium};
  }
`

export function FilledProgress(props: Props): JSX.Element {
  const {
    order: {
      filledAmount,
      filledPercentage,
      fullyFilled,
      kind,
      sellAmount,
      buyAmount,
      executedBuyAmount,
      executedSellAmount,
      buyToken,
      sellToken,
      buyTokenAddress,
      sellTokenAddress,
    },
  } = props

  const touched = filledPercentage.gt(0)

  let mainToken
  let mainAddress
  let mainAmount
  let swappedToken
  let swappedAddress
  let swappedAmount
  let action

  if (kind === 'sell') {
    mainToken = sellToken
    mainAddress = sellTokenAddress
    mainAmount = sellAmount
    swappedToken = buyToken
    swappedAddress = buyTokenAddress
    swappedAmount = executedBuyAmount
    action = 'sold'
  } else {
    mainToken = buyToken
    mainAddress = buyTokenAddress
    mainAmount = buyAmount
    swappedToken = sellToken
    swappedAddress = sellTokenAddress
    swappedAmount = executedSellAmount
    action = 'bought'
  }

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)
  const formattedFilledAmount = formatSmartMaxPrecision(filledAmount, mainToken)
  const formattedMainAmount = formatSmartMaxPrecision(mainAmount, mainToken)
  const formattedSwappedAmount = formatSmartMaxPrecision(swappedAmount, swappedToken)

  const formattedPercentage = filledPercentage.times('100').decimalPlaces(2).toString()

  return (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      <span>
        <b>
          {formattedFilledAmount} {mainSymbol}
        </b>{' '}
        {!fullyFilled && (
          <>
            of{' '}
            <b>
              {formattedMainAmount} {mainSymbol}
            </b>{' '}
          </>
        )}
        {action}{' '}
        {touched && (
          <>
            for a total of{' '}
            <b>
              {formattedSwappedAmount} {swappedSymbol}
            </b>
          </>
        )}
      </span>
    </Wrapper>
  )
}
