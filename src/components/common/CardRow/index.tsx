import React from 'react'
import styled from 'styled-components'

export type CardRowProps = { children?: React.ReactElement }

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
`

/**
 * CardRow component.
 *
 * Place cards side-by-side
 */
export const CardRow: React.FC<CardRowProps> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>
}
