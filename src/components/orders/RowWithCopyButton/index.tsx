import React from 'react'
import styled from 'styled-components'

import { CopyButton } from 'components/common/CopyButton'

const Wrapper = styled.span`
  display: flex;
  flex-wrap: no;

  & > :first-child {
    margin-right: 0.5rem;
  }
`

type Props = {
  textToCopy: string
  contentsToDisplay: string | JSX.Element
}

export function RowWithCopyButton(props: Props): JSX.Element {
  const { textToCopy, contentsToDisplay } = props

  // Wrap contents in a <span> if it's a raw string for proper CSS spacing
  const contentsComponent = typeof contentsToDisplay === 'string' ? <span>{contentsToDisplay}</span> : contentsToDisplay

  return (
    <Wrapper>
      {contentsComponent} <CopyButton text={textToCopy} />
    </Wrapper>
  )
}
