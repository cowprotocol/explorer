import React from 'react'
import styled, { DefaultTheme } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faClock, faDotCircle, faTimesCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons'

import { OrderStatus } from 'api/operator'

type DisplayProps = { status: OrderStatus }

function setStatusColors({ theme, status }: { theme: DefaultTheme; status: OrderStatus }): string {
  let background, text

  switch (status) {
    case 'expired':
    case 'canceled':
      text = theme.orange
      background = theme.orangeOpacity
      break
    case 'filled':
      text = theme.green
      background = theme.greenOpacity
      break
    case 'open':
      text = theme.labelTextOpen
      background = theme.labelBgOpen
      break
  }

  return `
      background: ${background};
      color: ${text};
    `
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
`

const Label = styled.div<DisplayProps>`
  font-weight: ${({ theme }): string => theme.fontBold};
  text-transform: capitalize;
  border-radius: 0.4rem;
  line-height: 1;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  ${({ theme, status }): string => setStatusColors({ theme, status })}
`

const StyledFAIcon = styled(FontAwesomeIcon)`
  margin: 0 0.75rem 0 0;
`

const PartialFill = styled.div`
  margin-left: 1rem;
  font-size: 0.85em; /* Intentional use of "em" to be relative to parent's font size */
  color: ${({ theme }): string => theme.textPrimary1};
`

function getStatusIcon(status: OrderStatus): IconDefinition {
  switch (status) {
    case 'expired':
      return faClock
    case 'filled':
      return faCheckCircle
    case 'canceled':
      return faTimesCircle
    case 'open':
      return faDotCircle
  }
}

function StatusIcon({ status }: DisplayProps): JSX.Element {
  const icon = getStatusIcon(status)

  return <StyledFAIcon icon={icon} />
}

export type Props = DisplayProps & { partiallyFilled: boolean }

export function StatusLabel(props: Props): JSX.Element {
  const { status, partiallyFilled } = props

  return (
    <Wrapper>
      <Label status={status}>
        <StatusIcon status={status} />
        {status}
      </Label>
      {partiallyFilled && <PartialFill>(partial fill)</PartialFill>}
    </Wrapper>
  )
}
