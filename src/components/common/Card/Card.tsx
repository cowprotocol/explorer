import React from 'react'
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid'

import { COLOURS } from 'styles'
import { Theme } from 'theme'

const { white, fadedGreyishWhite, blackLight } = COLOURS

const DefaultCard = styled.div`
  height: inherit;
  min-width: 200px;
  min-height: 100px;
  background-color: #f5f5f5;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 7%), 0 4px 6px -2px rgb(0 0 0 / 5%);
  margin: 10px;
`

const CardComponent = styled(DefaultCard)`
  display: flex;
  flex-direction: column;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  background: ${({ theme }): string => (theme.mode == Theme.DARK ? fadedGreyishWhite : white)};
  color: ${({ theme }): string => (theme.mode == Theme.DARK ? white : blackLight)};
`

// CARD CONTENT STYLES
const CardContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  padding: 16px;
  line-height: normal;
`

type CardBreakdown = boolean | 1 | 'auto' | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | undefined

export interface CardBaseProps {
  children?: React.ReactElement | string
  xs?: CardBreakdown
  sm?: CardBreakdown
  md?: CardBreakdown
  lg?: CardBreakdown
}

/**
 * Card component.
 *
 * An extensible content container.
 */
export const Card: React.FC<CardBaseProps> = ({ children, xs = 12, sm = 6, md = 4, lg = 3, ...rest }) => {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      <CardComponent {...rest}>
        <CardContent>{children}</CardContent>
      </CardComponent>
    </Grid>
  )
}
