import React from 'react'
import styled, { DefaultTheme } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faClock, faDotCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons'

import { OrderStatus } from 'api/operator'

export type Props = { status: OrderStatus }

function setStatusColors({ theme, status }: { theme: DefaultTheme; status: OrderStatus }): string {
  let background, text

  switch (status) {
    case 'expired':
      text = theme.orange
      background = theme.orangeOpacity
      break
    case 'filled':
    case 'partially filled':
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

const Wrapper = styled.div<Props>`
  font-size: ${({ theme }): string => theme.fontSizeDefault};
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

function getStatusIcon(status: OrderStatus): IconDefinition {
  switch (status) {
    case 'expired':
      return faClock
    case 'filled':
    case 'partially filled':
      return faCheckCircle
    case 'open':
      return faDotCircle
  }
}

function StatusIcon({ status }: Props): JSX.Element {
  const icon = getStatusIcon(status)

  return <StyledFAIcon icon={icon} />
}

export function StatusLabel(props: Props): JSX.Element {
  const { status } = props

  return (
    <Wrapper status={status}>
      <StatusIcon status={status} />
      {status}
    </Wrapper>
  )
}
