import React from 'react'
import { Placement } from '@popperjs/core'

import { Tooltip } from 'components/Tooltip'
import { usePopperDefault } from 'hooks/usePopper'

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
    <span className="wrap-text-tooltip">
      <Tooltip {...tooltipProps}>{textInTooltip}</Tooltip>
      <p {...targetProps}>{children}</p>
    </span>
  )
}
