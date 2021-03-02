import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { ProgressBar } from 'components/common/ProgressBar'

export type Props = {
  readonly percentage?: string
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;

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
  const { percentage = '0' } = props

  return (
    <Wrapper>
      <ProgressBar percentage={percentage} />
      <span>
        <b>2,430 DAI</b> of <b>3000 DAI</b> sold for a total of <b>2.842739643 ETH</b>
      </span>
    </Wrapper>
  )
}
