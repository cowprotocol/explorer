import React from 'react'
import styled from 'styled-components'

import { media } from 'theme/styles/media'

import { Order } from 'api/operator'

import { formatSmartMaxPrecision, safeTokenName } from 'utils'

import { ProgressBar } from 'components/common/ProgressBar'
import { OrderPriceDisplay } from '../OrderPriceDisplay'

export type Props = {
  order: Order
  fullView?: boolean
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

const TableHeading = styled.div`
  background: ${({ theme }): string => theme.tableRowBorder};
  min-height: 11rem;
  padding: 1.6rem;
  display: flex;
  gap: 2rem;
  ${media.mobile} {
    flex-direction: column;
    gap: 1rem;
  }
  .title {
    text-transform: uppercase;
    font-size: 1.1rem;
  }
  .fillNumber {
    font-size: 3.2rem;
    margin: 1.5rem 0 1rem 0;
    color: ${({ theme }): string => theme.green};
    ${media.mobile} {
      font-size: 2.8rem;
    }
  }

  .priceNumber {
    font-size: 2.2rem;
    margin: 1rem 0;
    ${media.mobile} {
      font-size: 1.8rem;
    }
    span {
      line-height: 1;
    }
  }
`

const TableHeadingContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 25rem;
  ${media.mobile} {
    flex-direction: column;
  }
  .progress-line {
    width: 100%;
  }
  &.limit-price {
    width: 38rem;
  }
`
const FilledContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1rem;
`

export function FilledProgress(props: Props): JSX.Element {
  const {
    fullView = false,
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
  let action: string | null | undefined

  let filledAmountWithFee, swappedAmountWithFee
  if (kind === 'sell') {
    action = 'sold'

    mainToken = sellToken
    mainAddress = sellTokenAddress
    mainAmount = sellAmount.plus(feeAmount)

    swappedToken = buyToken
    swappedAddress = buyTokenAddress
    swappedAmount = executedBuyAmount

    // Sell orders, add the fee in to the sellAmount (mainAmount, in this case)
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
    filledAmountWithFee = filledAmount
    swappedAmountWithFee = swappedAmount.plus(executedFeeAmount)
  }

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)

  const formattedMainAmount = formatSmartMaxPrecision(mainAmount, mainToken)
  const formattedFilledAmount = formatSmartMaxPrecision(filledAmountWithFee, mainToken)
  const formattedSwappedAmount = formatSmartMaxPrecision(swappedAmountWithFee, swappedToken)

  const formattedPercentage = filledPercentage.times('100').decimalPlaces(2).toString()
  const FormatedText = (): JSX.Element => (
    <>
      {' '}
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
    </>
  )
  return !fullView ? (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      <FormatedText />
    </Wrapper>
  ) : (
    <TableHeading>
      <TableHeadingContent>
        <FilledContainer>
          <div>
            <p className="title">Filled</p>
            <p className="fillNumber">{formattedPercentage}%</p>
          </div>
          <FormatedText />
        </FilledContainer>
        <ProgressBar showLabel={false} percentage={formattedPercentage} />
      </TableHeadingContent>
      <TableHeadingContent className="limit-price">
        <p className="title">Limit Price</p>
        <p className="priceNumber">
          {buyToken && sellToken && (
            <OrderPriceDisplay
              buyAmount={buyAmount}
              buyToken={buyToken}
              sellAmount={sellAmount}
              sellToken={sellToken}
              showInvertButton
            />
          )}
        </p>
      </TableHeadingContent>
    </TableHeading>
  )
}
