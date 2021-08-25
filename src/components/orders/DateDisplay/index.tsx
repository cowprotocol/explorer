import React from 'react'
import { formatDistanceToNowStrict, format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import styled from 'styled-components'

const IconWrapper = styled(FontAwesomeIcon)`
  margin-right: 0.4rem;
`

interface DateDisplayProps {
  date: Date
  showIcon?: boolean
}

export function DateDisplay({ date, showIcon }: DateDisplayProps): JSX.Element {
  // '5 days ago', '1h from now' date format
  const distance = formatDistanceToNowStrict(date, { addSuffix: true })
  // Long localized date and time '04/29/1453 12:00:00 AM'
  // P: Long localized date: 04/29/1453
  // pp: Long localized time: 12:00:00 AM
  // For reference: https://date-fns.org/v2.17.0/docs/format
  const fullLocaleBased = format(date, 'P pp')

  return (
    <span className="wrap-datedisplay">
      {showIcon && <IconWrapper icon={faClock} />} <span>{distance}</span> <span>({fullLocaleBased})</span>
    </span>
  )
}
