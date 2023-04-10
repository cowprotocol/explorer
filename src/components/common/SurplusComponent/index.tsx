import React from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import { formatPercentage, Surplus } from 'utils'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { TokenAmount } from 'components/token/TokenAmount'

const Percentage = styled.span`
  color: ${({ theme }): string => theme.green};
`

const Amount = styled.span<{ showHiddenSection: boolean; strechHiddenSection?: boolean }>`
  display: ${({ showHiddenSection }): string => (showHiddenSection ? 'flex' : 'none')};
  ${({ strechHiddenSection }): FlattenSimpleInterpolation | false | undefined =>
    strechHiddenSection &&
    css`
      width: 3.4rem;
      display: inline-block;
      justify-content: end;
    `}
`

export type SurplusComponentProps = {
  surplus: Surplus | null
  token: TokenErc20 | null
  showHidden?: boolean
  className?: string
}

export const SurplusComponent: React.FC<SurplusComponentProps> = (props) => {
  const { surplus, token, showHidden, className } = props

  if (!surplus || !token) {
    return null
  }

  const { percentage, amount } = surplus

  return (
    <div className={className}>
      <Percentage>{formatPercentage(percentage)}</Percentage>
      <Amount showHiddenSection={!!showHidden}>
        <TokenAmount amount={amount} token={token} />
      </Amount>
    </div>
  )
}
