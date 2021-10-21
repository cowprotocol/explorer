import React from 'react'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { Placement } from '@popperjs/core'
import styled from 'styled-components'
import { Tooltip } from 'components/Tooltip'
import { usePopperDefault } from 'hooks/usePopper'

const IconWrapper = styled(FontAwesomeIcon)`
  margin-right: 0.4rem;
`

interface DateDisplayProps {
  date: Date
  showIcon?: boolean
  tooltipPlacement?: Placement
}

export function DateDisplay({ date, showIcon, tooltipPlacement = 'top' }: DateDisplayProps): JSX.Element {
  const { tooltipProps, targetProps } = usePopperDefault<HTMLInputElement>(tooltipPlacement)
  // '5 days ago', '1h from now' date format
  const distance = formatDistanceToNowStrict(date, { addSuffix: true })
  // Long localized date and time '04/29/1453 12:00:00 AM'
  // P: Long localized date: 04/29/1453
  // pp: Long localized time: 12:00:00 AM
  // For reference: https://date-fns.org/v2.17.0/docs/format
  const fullLocaleBased = format(date, 'P pp zzzz')
  const previewDate = format(date, 'd MMMM yyyy - h:mm a')
  return (
    <span className="wrap-datedisplay">
      <Tooltip {...tooltipProps}>
        {distance} - {fullLocaleBased}
      </Tooltip>
      <div>
        {showIcon && (
          <span {...targetProps}>
            <IconWrapper icon={faClock} />
          </span>
        )}{' '}
        {!showIcon ? <span {...targetProps}>{previewDate}</span> : <span>{previewDate}</span>}
      </div>
    </span>
  )
}
