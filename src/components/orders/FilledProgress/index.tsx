import React from 'react'
import styled from 'styled-components'

import { formatSmart, safeTokenName } from '@gnosis.pm/dex-js'

import { media } from 'theme/styles/media'

import { Order } from 'api/operator'

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
      kind,
      executedBuyAmount,
      executedSellAmount,
      buyToken,
      sellToken,
      buyTokenAddress,
      sellTokenAddress,
    },
  } = props

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
    mainAmount = executedSellAmount
    swappedToken = buyToken
    swappedAddress = buyTokenAddress
    swappedAmount = executedBuyAmount
    action = 'sold'
  } else {
    mainToken = buyToken
    mainAddress = buyTokenAddress
    mainAmount = executedBuyAmount
    swappedToken = sellToken
    swappedAddress = sellTokenAddress
    swappedAmount = executedSellAmount
    action = 'bought'
  }

  // In case the token object is empty, display the address
  const mainSymbol = mainToken ? safeTokenName(mainToken) : mainAddress
  const swappedSymbol = swappedToken ? safeTokenName(swappedToken) : swappedAddress
  // In case the token object is empty, display the raw amount (`decimals || 0` part)
  const formattedFilledAmount = formatSmart(filledAmount.toString(10), mainToken?.decimals || 0)
  const formattedMainAmount = formatSmart(mainAmount.toString(10), mainToken?.decimals || 0)
  const formattedSwappedAmount = formatSmart(swappedAmount.toString(10), swappedToken?.decimals || 0)

  const formattedPercentage = filledPercentage.times('100').toString(10)

  return (
    <Wrapper>
      <ProgressBar percentage={formattedPercentage} />
      <span>
        <b>
          {formattedFilledAmount} {mainSymbol}
        </b>{' '}
        of{' '}
        <b>
          {formattedMainAmount} {mainSymbol}
        </b>{' '}
        {action} for a total of{' '}
        <b>
          {formattedSwappedAmount} {swappedSymbol}
        </b>
      </span>
    </Wrapper>
  )
}
