import React from 'react'
import styled, { DefaultTheme, css, keyframes, FlattenSimpleInterpolation } from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleNotch,
  faClock,
  faTimesCircle,
  IconDefinition,
  faKey,
} from '@fortawesome/free-solid-svg-icons'

import { OrderStatus } from 'api/operator'

type DisplayProps = { status: OrderStatus }

function setStatusColors({ theme, status }: { theme: DefaultTheme; status: OrderStatus }): string {
  let background, text

  switch (status) {
    case 'expired':
    case 'cancelled':
      text = theme.orange
      background = theme.orangeOpacity
      break
    case 'filled':
      text = theme.green
      background = theme.greenOpacity
      break
    case 'open':
    case 'signing':
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
const frameAnimation = keyframes`
    100% {
      -webkit-mask-position: left;
    }
`
type ShimmingProps = {
  shimming?: boolean
}

const Label = styled.div<DisplayProps & ShimmingProps>`
  font-weight: ${({ theme }): string => theme.fontBold};
  text-transform: capitalize;
  border-radius: 0.4rem;
  line-height: 1;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  ${({ theme, status }): string => setStatusColors({ theme, status })}
  ${({ shimming }): FlattenSimpleInterpolation | null =>
    shimming
      ? css`
          display: inline-block;
          -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite;
          animation-name: ${frameAnimation};
        `
      : null}
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
    case 'cancelled':
      return faTimesCircle
    case 'signing':
      return faKey
    case 'open':
      return faCircleNotch
  }
}

function StatusIcon({ status }: DisplayProps): JSX.Element {
  const icon = getStatusIcon(status)
  const isOpen = status === 'open'

  return <StyledFAIcon icon={icon} spin={isOpen} />
}

export type Props = DisplayProps & { partiallyFilled: boolean }

export function StatusLabel(props: Props): JSX.Element {
  const { status, partiallyFilled } = props
  const shimming = status === 'signing'

  return (
    <Wrapper>
      <Label status={status} shimming={shimming}>
        <StatusIcon status={status} />
        {status}
      </Label>
      {partiallyFilled && <PartialFill>(partial fill)</PartialFill>}
    </Wrapper>
  )
}
