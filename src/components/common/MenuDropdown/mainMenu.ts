import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'

import IMAGE_DISCORD from 'assets/img/discord.svg'

export const menuContent = [
  {
    title: 'Home',
    items: [],
    kind: 'EXTERNAL_LINK',
    url: Routes.HOME,
  },
  {
    kind: 'DROP_DOWN',
    title: 'More',
    items: [
      {
        sectionTitle: 'OVERVIEW',
        links: [
          {
            title: 'CoW Protocol',
            url: PROTOCOL_LINK,
          },
          {
            title: 'Documentation',
            url: DOCS_LINK,
          },
          {
            title: 'Analytics',
            url: DUNE_DASHBOARD_LINK,
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
            url: Routes.APPDATA,
            /* icon?: string, // If icon uses a regular <img /> tag */
            /*  iconSVG?: string // If icon is a <SVG> inline component */
          },
        ],
      },
    ],
  },
]
