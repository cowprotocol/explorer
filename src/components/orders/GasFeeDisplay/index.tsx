import React from 'react'
import styled from 'styled-components'

import { Order } from 'api/operator'

import { formatSmartMaxPrecision, safeTokenName } from 'utils'

const Wrapper = styled.div`
  & > span {
    margin: 0 0.5rem 0 0;
  }
`

// const UsdAmount = styled.span`
//   color: ${({ theme }): string => theme.grey};
// `

export type Props = { order: Order }

export function GasFeeDisplay(props: Props): JSX.Element | null {
  const {
    order: { feeAmount, executedFeeAmount, sellToken, sellTokenAddress, fullyFilled },
  } = props

  // TODO: fetch amount in USD
  // const executedFeeUSD = '0.99'
  // const totalFeeUSD = '0.35'

  // When `sellToken` is not set, default to raw amounts
  let formattedExecutedFee: string = executedFeeAmount.toString(10)
  let formattedTotalFee: string = feeAmount.toString(10)
  // When `sellToken` is not set, show token address
  let quoteSymbol: string = sellTokenAddress

  if (sellToken) {
    formattedExecutedFee = formatSmartMaxPrecision(executedFeeAmount, sellToken)
    formattedTotalFee = formatSmartMaxPrecision(feeAmount, sellToken)

    quoteSymbol = safeTokenName(sellToken)
  }

  return (
    <Wrapper>
      <span>
        {formattedExecutedFee} {quoteSymbol}
      </span>
      {/* <UsdAmount>(~${totalFeeUSD})</UsdAmount> */}
      {!fullyFilled && (
        <>
          <span>
            of {formattedTotalFee} {quoteSymbol}
          </span>
          {/* <UsdAmount>(~${executedFeeUSD})</UsdAmount> */}
        </>
      )}
    </Wrapper>
  )
}
