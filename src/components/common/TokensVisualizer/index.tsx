import React from 'react'
import styled from 'styled-components'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'

import { TokenDisplay } from 'components/common/TokenDisplay'

const MAX_AMOUNT = 4
export type Props = { tokens: TokenErc20[]; network: Network; amountDisplayed?: number }

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10px, max-content));
  & > div:not(.token-number) {
    width: 4vw;
  }
  img {
    margin: 0;
    width: 3rem;
    height: 3rem;
  }
`
const TokenNumber = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${({ theme }): string => theme.grey1};
  display: flex;
  align-items: center;
  justify-content: center;
`

export function TokensVisualizer(props: Props): JSX.Element {
  const { tokens, network, amountDisplayed = MAX_AMOUNT } = props
  const tokensLeft = tokens.slice(amountDisplayed, tokens.length).length
  return (
    <Wrapper>
      {tokens.slice(0, amountDisplayed).map((token) => (
        <TokenDisplay key={token.address} erc20={token} network={network} hideLabel />
      ))}
      {tokensLeft > 0 && (
        <TokenNumber className="token-number">
          <span>+{tokensLeft}</span>
        </TokenNumber>
      )}
    </Wrapper>
  )
}
