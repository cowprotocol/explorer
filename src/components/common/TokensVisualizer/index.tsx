import React from 'react'
import styled from 'styled-components'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'

import { media } from 'theme/styles/media'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { TokenDisplay } from 'components/common/TokenDisplay'

const MAX_AMOUNT = 4
export type Props = { tokens: TokenErc20[]; network: Network; amountDisplayed?: number }

const Wrapper = styled.div<{ amount: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10px, max-content));
  & > div:not(.token-number) {
    width: 5rem;
    ${media.mobile} {
      width: ${(props): string | 'auto' => (props.amount >= 3 ? '3rem' : 'auto')};
      margin-right: ${(props): string | 'auto' => (props.amount >= 3 ? `${props.amount}rem` : 'none')};
    }
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
    <Wrapper amount={tokens.slice(0, amountDisplayed).length}>
      {tokens.slice(0, amountDisplayed).map((token) => (
        <TextWithTooltip key={token.address} textInTooltip={token.symbol || 'Unknown'}>
          <BlockExplorerLink type="address" networkId={network} identifier={token.address}>
            <TokenDisplay erc20={token} network={network} hideLabel />
          </BlockExplorerLink>
        </TextWithTooltip>
      ))}
      {tokensLeft > 0 && (
        <TokenNumber className="token-number">
          <span>+{tokensLeft}</span>
        </TokenNumber>
      )}
    </Wrapper>
  )
}
