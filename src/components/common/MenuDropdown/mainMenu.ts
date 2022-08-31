import { DOCS_LINK, DISCORD_LINK /* Routes  */ } from 'apps/explorer/const'

import IMAGE_DISCORD from 'assets/img/discord.svg'

export const itemContent = {
  kind: 'DROP_DOWN',
  title: 'More',
  items: [
    {
      sectionTitle: 'OVERVIEW',
      links: [
        {
          title: 'CoW Protocossl',
          url: 'https://cow.fi',
        },
        {
          title: 'Documentation',
          url: DOCS_LINK,
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
          url: DISCORD_LINK,
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
