import React, { useState, createRef } from 'react'

import { MenuBarToggle, Navigation } from 'components/layout/GenericLayout/Navigation'
import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FlexWrap } from 'apps/explorer/pages/styled'
// import { ExternalLink } from 'components/analytics/ExternalLink'
import { useHistory } from 'react-router'
import useOnClickOutside from 'hooks/useOnClickOutside'
// import { APP_NAME } from 'const'
import MenuDropdown from 'components/common/MenuDropdown'

const itemContent = {
  kind: 'DROP_DOWN',
  title: 'More',
  items: [
    {
      sectionTitle: 'OVERVIEW',
      links: [
        {
          title: 'CoW Protocol',
          url: 'https://cow.fi',
        },
        {
          title: 'Documentation',
          url: 'https://docs.cow.fi',
        },
        {
          title: 'Analytics',
          url: 'https://dune.xyz/gnosis.protocol/Gnosis-Protocol-V2',
        },
      ],
    },
    {
      sectionTitle: 'COMMUNITY',
      links: [
        {
          title: 'Discord',
          url: 'https://discord.gg/cowprotocol',
          /* icon?: string, // If icon uses a regular <img /> tag */
          /*  iconSVG?: string // If icon is a <SVG> inline component */
        },
      ],
    },
    {
      sectionTitle: 'OTHER',
      links: [
        {
          title: 'App Data',
          url: '#',
          /* icon?: string, // If icon uses a regular <img /> tag */
          /*  iconSVG?: string // If icon is a <SVG> inline component */
        },
      ],
    },
  ],
}

export const Header: React.FC = () => {
  const history = useHistory()
  const [isBarActive, setBarActive] = useState(false)
  const flexWrapDivRef = createRef<HTMLDivElement>()
  useOnClickOutside(flexWrapDivRef, () => isBarActive && setBarActive(false))

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault()
    setBarActive(false)
    history.push(`/${prefixNetwork || ''}`)
  }

  return (
    <GenericHeader logoAlt="CoW Protocol Explorer" linkTo={`/${prefixNetwork || ''}`}>
      <NetworkSelector networkId={networkId} />
      <FlexWrap ref={flexWrapDivRef} grow={1}>
        <MenuDropdown itemContent={itemContent} />
        <MenuBarToggle isActive={isBarActive} onClick={(): void => setBarActive(!isBarActive)}>
          <FontAwesomeIcon icon={isBarActive ? faTimes : faEllipsisH} />
        </MenuBarToggle>
        <Navigation isActive={isBarActive}>
          <li>
            <a onClick={(e): void => handleNavigate(e)}>Home</a>
          </li>
          {/*   <li>
            <ExternalLink target={'_blank'} href={'https://cow.fi'}>
              {APP_NAME}
            </ExternalLink>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://docs.cow.fi'}>
              Documentation
            </ExternalLink>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://discord.gg/cowprotocol'}>
              Community
            </ExternalLink>
          </li>
          <li>
            <ExternalLink target={'_blank'} href={'https://dune.xyz/gnosis.protocol/Gnosis-Protocol-V2'}>
              Analytics
            </ExternalLink>
          </li> */}
        </Navigation>
      </FlexWrap>
    </GenericHeader>
  )
}
