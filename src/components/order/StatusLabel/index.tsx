import React, { useMemo } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faClock, faDotCircle } from '@fortawesome/free-solid-svg-icons'

import { OrderStatus } from 'api/operator'

export type Props = { status: OrderStatus }

const Wrapper = styled.div<Props>`
  font-size: ${({ theme }): string => theme.fontSizeNormal};
  font-weight: ${({ theme }): string => theme.fontWeightBold};
  text-transform: capitalize;

  border-radius: 0.4rem;

  padding: 0.75em;
  display: inline-block;

  & > svg {
    margin: 0 0.75rem 0 0;
  }

  ${({ theme, status }): string => {
    let background, color

    switch (status) {
      case 'expired':
        color = theme.labelTextExpired
        background = theme.labelBgExpired
        break
      case 'filled':
      case 'partially filled':
        color = theme.labelTextFilled
        background = theme.labelBgFilled
        break
      case 'open':
        color = theme.labelTextOpen
        background = theme.labelBgOpen
        break
    }
    return `
      background: ${background};
      color: ${color};
    `
  }}
`

export const StatusLabel = (props: Props): JSX.Element => {
  const { status } = props

  const icon = useMemo(() => {
    switch (status) {
      case 'expired':
        return <FontAwesomeIcon icon={faClock} />
      case 'filled':
      case 'partially filled':
        return <FontAwesomeIcon icon={faCheckCircle} />
      case 'open':
        return <FontAwesomeIcon icon={faDotCircle} />
    }
  }, [status])

  return (
    <Wrapper status={status}>
      {icon}
      {status}
    </Wrapper>
  )
}
