import React from 'react'
import SVG from 'react-inlinesvg'

import { ExternalLink } from 'components/analytics/ExternalLink'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { MenuImageProps, MenuItemKind, MenuLink } from './types'

function MenuImage(props: MenuImageProps): JSX.Element | null {
  const { title, iconSVG, icon } = props

  if (iconSVG) {
    return <SVG src={iconSVG} description={`${title} icon`} />
  } else if (icon) {
    return <img src={icon} alt={`${title} icon`} />
  } else {
    return null
  }
}

interface InternalExternalLinkProps {
  link: MenuLink
  handleMobileMenuOnClick?: () => void
}

export default function InternalExternalMenuLink({
  link,
  handleMobileMenuOnClick,
}: InternalExternalLinkProps): JSX.Element {
  const { kind, title, url, iconSVG, icon } = link
  const menuImage = <MenuImage title={title} icon={icon} iconSVG={iconSVG} />
  const isExternal = kind === MenuItemKind.EXTERNAL_LINK

  if (isExternal) {
    return (
      <ExternalLink target={'_blank'} href={url} onClick={handleMobileMenuOnClick}>
        {menuImage}
        {title}
      </ExternalLink>
    )
  } else {
    return (
      <LinkWithPrefixNetwork
        to={url}
        rel="noopener noreferrer"
        target="_self"
        onClickOptional={handleMobileMenuOnClick}
      >
        {menuImage}
        {title}
      </LinkWithPrefixNetwork>
    )
  }
}
