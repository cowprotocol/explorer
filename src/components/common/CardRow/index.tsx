import React from 'react'
import Grid from '@material-ui/core/Grid'

export type CardRowProps = { children?: React.ReactElement }

/**
 * CardRow component.
 *
 * Place cards side-by-side
 */
export const CardRow: React.FC<CardRowProps> = ({ children }) => {
  return <Grid container>{children}</Grid>
}
