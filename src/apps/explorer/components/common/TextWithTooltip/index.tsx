import React from 'react'
import { Placement } from '@popperjs/core'
import styled from 'styled-components'

import { Tooltip } from 'components/Tooltip'
import { usePopperDefault } from 'hooks/usePopper'

const Wrapper = styled.span`
  > p {
    margin: 0;
  }
`

interface TextTooltipProps {
  children: React.ReactNode
  textInTooltip: string
  tooltipPlacement?: Placement
}

export const TextWithTooltip: React.FC<TextTooltipProps> = ({
  children,
  textInTooltip,
  tooltipPlacement = 'top',
}): JSX.Element => {
  const { tooltipProps, targetProps } = usePopperDefault<HTMLInputElement>(tooltipPlacement)
  return (
    <Wrapper>
      <Tooltip {...tooltipProps}>{textInTooltip}</Tooltip>
      <p {...targetProps}>{children}</p>
    </Wrapper>
  )
}
