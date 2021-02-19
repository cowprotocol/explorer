import React from 'react'
import { formatDistanceToNowStrict, format } from 'date-fns'

export function DateDisplay({ date }: { date: Date }): JSX.Element {
  // '5 days ago', '1h from now' date format
  const distance = formatDistanceToNowStrict(date, { addSuffix: true })
  // Long localized date and time '04/29/1453 12:00:00 AM'
  // P: Long localized date: 04/29/1453
  // pp: Long localized time: 12:00:00 AM
  // For reference: https://date-fns.org/v2.17.0/docs/format
  const fullLocaleBased = format(date, 'P pp')

  return (
    <span>
      {distance} ({fullLocaleBased})
    </span>
  )
}
