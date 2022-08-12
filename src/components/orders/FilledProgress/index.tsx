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
      executedFeeAmount,
      filledAmount,
      filledPercentage,
      fullyFilled,
      kind,
      feeAmount,
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

  let filledAmountWithFee, mainAmountWithFee, swappedAmountWithFee
  if (kind === 'sell') {
    action = 'sold'

    mainToken = sellToken
    mainAddress = sellTokenAddress
    mainAmount = sellAmount.plus(feeAmount)

    swappedToken = buyToken
    swappedAddress = buyTokenAddress
    swappedAmount = executedBuyAmount

    // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
    mainAmountWithFee = mainAmount.plus(feeAmount)
    filledAmountWithFee = filledAmount.plus(executedFeeAmount)
    swappedAmountWithFee = swappedAmount
  } else {
    action = 'bought'

    mainToken = buyToken
    mainAddress = buyTokenAddress
    mainAmount = buyAmount

    swappedToken = sellToken
    swappedAddress = sellTokenAddress
    swappedAmount = executedSellAmount

    // Buy orders need to add the fee, to the sellToken too (swappedAmount in this case)
    mainAmountWithFee = mainAmount
    filledAmountWithFee = filledAmount
    swappedAmountWithFee = swappedAmount.plus(executedFeeAmount)
  }

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)

  const formattedMainAmount = formatSmartMaxPrecision(mainAmountWithFee, mainToken)
  const formattedFilledAmount = formatSmartMaxPrecision(filledAmountWithFee, mainToken)
  const formattedSwappedAmount = formatSmartMaxPrecision(swappedAmountWithFee, swappedToken)

  const formattedPercentage = filledPercentage.times('100').decimalPlaces(2).toString()

  return (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      <span>
        <b>
          {/* Executed part (bought/sold tokens) */}
          {formattedFilledAmount} {mainSymbol}
        </b>{' '}
        {!fullyFilled && (
          // Show the total amount to buy/sell. Only for orders that are not 100% executed
          <>
            of{' '}
            <b>
              {formattedMainAmount} {mainSymbol}
            </b>{' '}
          </>
        )}
        {action}{' '}
        {touched && (
          // Executed part of the trade:
          //    Total buy tokens you receive (for sell orders)
          //    Total sell tokens you pay (for buy orders)
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
