import React, { useState, createRef } from 'react'

import { Header as GenericHeader } from 'components/layout/GenericLayout/Header'
import { NetworkSelector } from 'components/NetworkSelector'
import { PREFIX_BY_NETWORK_ID, useNetworkId } from 'state/network'
import { FlexWrap } from 'apps/explorer/pages/styled'
// import { ExternalLink } from 'components/analytics/ExternalLink'
// import { useHistory } from 'react-router'
import useOnClickOutside from 'hooks/useOnClickOutside'
// import { APP_NAME } from 'const'
import MenuDropdown from 'components/common/MenuDropdown'

import IMAGE_DISCORD from 'assets/img/discord.svg'

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
          iconSVG: IMAGE_DISCORD, // If icon is a <SVG> inline component
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
  //const history = useHistory()
  const [isBarActive, setBarActive] = useState(false)
  const flexWrapDivRef = createRef<HTMLDivElement>()

  useOnClickOutside(flexWrapDivRef, () => isBarActive && setBarActive(false))

  const networkId = useNetworkId()
  if (!networkId) {
    return null
  }

  const prefixNetwork = PREFIX_BY_NETWORK_ID.get(networkId)

  return (
    <GenericHeader logoAlt="CoW Protocol Explorer" linkTo={`/${prefixNetwork || ''}`}>
      <NetworkSelector networkId={networkId} />
      <FlexWrap ref={flexWrapDivRef} grow={1}>
        <MenuDropdown itemContent={itemContent} />
      </FlexWrap>
    </GenericHeader>
  )
}
