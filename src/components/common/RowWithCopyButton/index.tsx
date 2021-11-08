import React from 'react'
import styled from 'styled-components'

import { CopyButton } from 'components/common/CopyButton'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  & > :first-child {
    margin-right: 0.75rem;
    word-break: break-all;
  }
`

const Content = styled.div`
  display: inline-block;
`

type Props = {
  textToCopy: string
  contentsToDisplay: string | JSX.Element
  className?: string
  visible?: boolean
  onCopy?: (value: string) => void
}

export function RowWithCopyButton(props: Props): JSX.Element {
  const { textToCopy, contentsToDisplay, className, onCopy, visible } = props

  // Wrap contents in a <span> if it's a raw string for proper CSS spacing
  const contentsComponent = typeof contentsToDisplay === 'string' ? <span>{contentsToDisplay}</span> : contentsToDisplay

  return (
    <Wrapper className={className}>
      <Content>{contentsComponent}</Content> {visible && <CopyButton text={textToCopy} onCopy={onCopy} />}
    </Wrapper>
  )
}
