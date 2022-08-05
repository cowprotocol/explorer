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
  faCircleHalfStroke,
} from '@fortawesome/free-solid-svg-icons'

import { OrderStatus } from 'api/operator'

type CustomOrderStatus = OrderStatus | 'partial fill'
type DisplayProps = { status: CustomOrderStatus }

function setStatusColors({
  theme,
  status,
}: {
  theme: DefaultTheme
  status: CustomOrderStatus
}): string | FlattenSimpleInterpolation {
  let background, text

  switch (status) {
    case 'expired':
    case 'cancelled':
    case 'cancelling':
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
    case 'partial fill':
      return css`
        background: linear-gradient(180deg, rgba(0, 216, 151, 0.1) 0%, rgba(217, 109, 73, 0.1) 100%);
        font-size: 0.9em;
        color: ${theme.green};
        align-items: end;
        .svg-inline--fa {
          font-size: 1.3rem;
          margin-right: 0.5rem;
        }
      `
  }

  return `
      background: ${background};
      color: ${text};
    `
}

type PartiallyTagPosition = 'right' | 'bottom'
type PartiallyTagProps = { partialFill: boolean; tagPosition: PartiallyTagPosition }

const PartiallyTagLabel = css<PartiallyTagProps>`
  &:after {
    ${({ partialFill, theme }): FlattenSimpleInterpolation | null =>
      partialFill
        ? css`
            content: 'Partial fill';
            background: ${theme.orange};
            font-size: 0.85em; /* Intentional use of "em" to be relative to parent's font size */
            color: ${theme.textPrimary1};
            width: 100%;
            text-align: center;
            border-radius: 0 0 0.4rem 0.4rem;
          `
        : null}

    ${({ partialFill, tagPosition }): FlattenSimpleInterpolation | null =>
      partialFill && tagPosition === 'right'
        ? css`
            border-radius: 0 0.4rem 0.4rem 0;
            display: flex;
            align-items: center;
            padding: 0 0.6rem;
          `
        : null}
  }
`
const Wrapper = styled.div<PartiallyTagProps>`
  display: flex;
  flex-direction: ${({ tagPosition }): string => (tagPosition === 'bottom' ? 'column' : 'row')};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  ${PartiallyTagLabel}
`
const frameAnimation = keyframes`
    100% {
      -webkit-mask-position: left;
    }
`
type ShimmingProps = {
  shimming?: boolean
}

const Label = styled.div<DisplayProps & ShimmingProps & PartiallyTagProps>`
  font-weight: ${({ theme }): string => theme.fontBold};
  border-radius: 0.4rem;
  line-height: 1;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  min-height: 2.8rem;
  ${({ theme, status }): string | FlattenSimpleInterpolation => setStatusColors({ theme, status })}
  ${({ shimming }): FlattenSimpleInterpolation | null =>
    shimming
      ? css`
          -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite;
          animation-name: ${frameAnimation};
        `
      : null}
  ${({ partialFill: partiallyFilled, tagPosition }): FlattenSimpleInterpolation | null =>
    partiallyFilled
      ? tagPosition === 'bottom'
        ? css`
            font-size: 1.14rem;
            border-radius: 0.4rem 0.4rem 0 0;
          `
        : css`
            border-radius: 0.4rem 0 0 0.4rem;
          `
      : null}
`

const StyledFAIcon = styled(FontAwesomeIcon)`
  margin: 0 0.75rem 0 0;
`

function getStatusIcon(status: CustomOrderStatus): IconDefinition {
  switch (status) {
    case 'expired':
      return faClock
    case 'filled':
      return faCheckCircle
    case 'cancelled':
      return faTimesCircle
    case 'cancelling':
      return faTimesCircle
    case 'signing':
      return faKey
    case 'open':
      return faCircleNotch
    case 'partial fill':
      return faCircleHalfStroke
  }
}

function StatusIcon({ status }: DisplayProps): JSX.Element {
  const icon = getStatusIcon(status)
  const isOpen = status === 'open'

  return <StyledFAIcon icon={icon} spin={isOpen} />
}

export type Props = DisplayProps & { partiallyFilled: boolean; partialTagPosition?: PartiallyTagPosition }

export function StatusLabel(props: Props): JSX.Element {
  const { status, partiallyFilled: partiallyFilled, partialTagPosition = 'bottom' } = props
  const shimming = status === 'signing' || status === 'cancelling'
  const isExpired = status === 'expired'
  const tagPartiallyFilled = !isExpired && partiallyFilled
  const _status = isExpired && partiallyFilled ? 'partial fill' : status

  return (
    <Wrapper partialFill={tagPartiallyFilled} tagPosition={partialTagPosition}>
      <Label status={_status} shimming={shimming} partialFill={tagPartiallyFilled} tagPosition={partialTagPosition}>
        <StatusIcon status={_status} />
        {_status.charAt(0).toUpperCase() + _status.slice(1)}
      </Label>
    </Wrapper>
  )
}
