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
      text = theme.labelTextExpired
      background = theme.labelBgExpired
      break
    case 'filled':
    case 'partially filled':
      text = theme.labelTextFilled
      background = theme.labelBgFilled
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
  font-size: ${({ theme }): string => theme.fontSizeNormal};
  font-weight: ${({ theme }): string => theme.fontWeightBold};
  text-transform: capitalize;

  border-radius: 0.4rem;

  padding: 0.75em;
  display: inline-block;

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
