import React from 'react'
import styled from 'styled-components'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'
import { getNativeTokenName, isNativeToken } from 'utils'

import { useTokenList } from 'hooks/useTokenList'
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
    box-shadow: ${({ theme }): string => theme.boxShadow};
    border: 1px solid ${({ theme }): string => theme.bg2};
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
  const { tokens: tokenList } = useTokenList({ networkId: network })
  const mappedTokens = tokens.map((t) => {
    const isNative = isNativeToken(t.address)
    if (isNative) {
      const { nativeToken } = getNativeTokenName(network)
      return { ...t, symbol: nativeToken }
    }
    return t
  })

  const getToken = (address: string): string => {
    const token = tokenList.find((t) => t.address === address)
    return token?.symbol || 'Unknown'
  }

  const tokensLeft = mappedTokens.slice(amountDisplayed, tokens.length)
  return (
    <Wrapper amount={mappedTokens.slice(0, amountDisplayed).length}>
      {mappedTokens.slice(0, amountDisplayed).map((token) => (
        <TextWithTooltip key={token.address} textInTooltip={token.symbol || getToken(token.address)}>
          <BlockExplorerLink type="address" networkId={network} identifier={token.address}>
            <TokenDisplay erc20={token} network={network} hideLabel />
          </BlockExplorerLink>
        </TextWithTooltip>
      ))}
      {tokensLeft.length > 0 && (
        <TextWithTooltip textInTooltip={tokensLeft.map((t) => t.symbol).join(',')}>
          <TokenNumber className="token-number">
            <span>+{tokensLeft.length}</span>
          </TokenNumber>
        </TextWithTooltip>
      )}
    </Wrapper>
  )
}
