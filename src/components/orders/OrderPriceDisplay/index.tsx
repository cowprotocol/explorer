import React, { useState } from 'react'
import styled from 'styled-components'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'

import { calculatePrice, formatSmart, invertPrice, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: ${({ theme }): string => theme.fontSizeNormal};
`

const Icon = styled(FontAwesomeIcon)`
  background: ${({ theme }): string => theme.textSecondary2}33; /* 33==20% transparency in hex */
  border-radius: 1rem;
  width: 2rem !important; /* FontAwesome sets it to 1em with higher specificity */
  height: 2rem;
  padding: 0.4rem;
  margin-left: 0.5rem;
`

export type Props = {
  buyAmount: string | BigNumber
  buyToken: TokenErc20
  sellAmount: string | BigNumber
  sellToken: TokenErc20
  isPriceInverted?: boolean
  showInvertButton?: boolean
}

export function OrderPriceDisplay(props: Props): JSX.Element {
  const {
    buyAmount,
    buyToken,
    sellAmount,
    sellToken,
    isPriceInverted: initialInvertedPrice = false,
    showInvertButton = false,
  } = props

  const [isPriceInverted, setIsPriceInverted] = useState(initialInvertedPrice)
  const invert = (): void => setIsPriceInverted((curr) => !curr)

  const calculatedPrice = calculatePrice({
    denominator: { amount: buyAmount, decimals: buyToken.decimals },
    numerator: { amount: sellAmount, decimals: sellToken.decimals },
  })
  const displayPrice = (isPriceInverted ? invertPrice(calculatedPrice) : calculatedPrice).toString()
  const formattedPrice = formatSmart({
    amount: displayPrice,
    precision: 0,
    smallLimit: '0.000001',
    decimals: 7,
  })

  const buySymbol = safeTokenName(buyToken)
  const sellSymbol = safeTokenName(sellToken)

  const [baseSymbol, quoteSymbol] = isPriceInverted ? [sellSymbol, buySymbol] : [buySymbol, sellSymbol]

  return (
    <Wrapper>
      {formattedPrice} {baseSymbol} for {quoteSymbol}
      {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
    </Wrapper>
  )
}
