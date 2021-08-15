import React, { useState } from 'react'
import styled from 'styled-components'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { ConstructedPrice, constructPrice } from 'utils'
import Icon from 'components/Icon'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
`

export type OrderPriceDisplayType = {
  buyAmount: string | BigNumber
  buyToken: TokenErc20
  sellAmount: string | BigNumber
  sellToken: TokenErc20
  isPriceInverted?: boolean
  showInvertButton?: boolean
}

export function OrderPriceDisplay(props: OrderPriceDisplayType): JSX.Element {
  const {
    buyAmount,
    buyToken,
    sellAmount,
    sellToken,
    isPriceInverted: initialInvertedPrice = false,
    showInvertButton = false,
  } = props

  const [isPriceInverted, setIsPriceInverted] = useState(initialInvertedPrice)
  const [formattedPrice, setFormattedPrice] = useState('')
  const invert = (): void => setIsPriceInverted(!isPriceInverted)

  React.useEffect((): void => {
    const price: ConstructedPrice = constructPrice({
      isPriceInverted: props.isPriceInverted ?? false,
      order: props,
      data: {
        numerator: {
          amount: new BigNumber(sellAmount),
          token: sellToken,
        },
        denominator: {
          amount: new BigNumber(buyAmount),
          token: buyToken,
        },
      },
    })
    setFormattedPrice(`${price.formattedAmount ?? ''} ${price.quoteSymbol} for ${price.baseSymbol}`)
  }, [isPriceInverted])

  return (
    <Wrapper>
      {formattedPrice}
      {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
    </Wrapper>
  )
}
