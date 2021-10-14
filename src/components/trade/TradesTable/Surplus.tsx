import React from 'react'
import styled from 'styled-components'
import { BigNumber } from 'bignumber.js'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const PositivePercentage = styled.div`
  color: ${({ theme }): string => theme.green1};
`

const NegativePercentage = styled.div`
  color: ${({ theme }): string => theme.red1};
`

const Amount = styled.div`
  color: ${({ theme }): string => theme.grey};
`

export type Props = {
  surplusPercentage: BigNumber
  surplusAmount: BigNumber
}

export function Surplus(props: Props): JSX.Element {
  const { surplusPercentage, surplusAmount } = props

  return (
    <Wrapper>
      {surplusPercentage.isLessThan(0) ? (
        <NegativePercentage>{surplusPercentage.toString()}%</NegativePercentage>
      ) : (
        <PositivePercentage>+{surplusPercentage.toString()}%</PositivePercentage>
      )}
      <Amount>~${surplusAmount.toString()}</Amount>
    </Wrapper>
  )
}
