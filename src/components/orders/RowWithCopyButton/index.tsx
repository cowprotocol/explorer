import React from 'react'
import styled from 'styled-components'

import { CopyButton } from 'components/common/CopyButton'

const Wrapper = styled.span`
  display: flex;
  flex-wrap: nowrap;

  & > :first-child {
    margin-right: 0.75rem;
    word-break: break-all;
  }
`

type Props = {
  textToCopy: string
  contentsToDisplay: string | JSX.Element
  className?: string
}

export function RowWithCopyButton(props: Props): JSX.Element {
  const { textToCopy, contentsToDisplay, className } = props

  // Wrap contents in a <span> if it's a raw string for proper CSS spacing
  const contentsComponent = typeof contentsToDisplay === 'string' ? <span>{contentsToDisplay}</span> : contentsToDisplay

  return (
    <Wrapper className={className}>
      {contentsComponent} <CopyButton text={textToCopy} />
    </Wrapper>
  )
}
