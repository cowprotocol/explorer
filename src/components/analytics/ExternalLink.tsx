import React, { PropsWithChildren, ReactNode } from 'react'
import { OutboundLink, OutboundLinkProps } from 'react-ga'

type PropsOriginal = PropsWithChildren<OutboundLinkProps & React.HTMLProps<HTMLAnchorElement>>
type Props = Omit<PropsOriginal, 'ref' | 'to' | 'eventLabel'> & {
  eventLabel?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  children?: ReactNode
  href: string
}

export const ExternalLink: React.FC<Props> = (props: Props) => {
  const { eventLabel, children, href, onClick } = props
  const outboundProps = {
    ...props,
    onClick,
    eventLabel: eventLabel || href,
  }
  return (
    <OutboundLink to={href} {...outboundProps}>
      {children}
    </OutboundLink>
  )
}
