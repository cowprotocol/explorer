import React, { useState } from 'react'
import styled from 'styled-components'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { constructPrice } from 'utils'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
`

const Icon = styled(FontAwesomeIcon)`
  background: ${({ theme }): string => theme.grey}33; /* 33==20% transparency in hex */
  border-radius: 1rem;
  width: 2rem !important; /* FontAwesome sets it to 1em with higher specificity */
  height: 2rem;
  padding: 0.4rem;
  margin-left: 0.5rem;
  cursor: pointer;
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
  const [formattedPrice, setFormattedPrice] = useState('')
  const invert = (): void => setIsPriceInverted(!isPriceInverted)

  React.useEffect((): void => {
    const price: string = constructPrice({
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
    setFormattedPrice(price)
  }, [isPriceInverted])

  return (
    <Wrapper>
      {formattedPrice}
      {showInvertButton && <Icon icon={faExchangeAlt} onClick={invert} />}
    </Wrapper>
  )
}
