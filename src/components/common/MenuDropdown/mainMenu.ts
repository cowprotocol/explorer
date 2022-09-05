import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
import IMAGE_DISCORD from 'assets/img/discord.svg'
import { MenuItemKind, MenuTreeItem } from './types'

export const menuContent: MenuTreeItem[] = [
  {
    title: 'Home',
    url: Routes.HOME,
  },
  {
    kind: MenuItemKind.DROP_DOWN,
    title: 'More',
    items: [
      {
        sectionTitle: 'OVERVIEW',
        links: [
          {
            title: 'CoW Protocol',
            url: PROTOCOL_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
          {
            title: 'Documentation',
            url: DOCS_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
          {
            title: 'Analytics',
            url: DUNE_DASHBOARD_LINK,
            kind: MenuItemKind.EXTERNAL_LINK,
          },
        ],
      },
      {
        sectionTitle: 'COMMUNITY',
        links: [
          {
            title: 'Discord',
            url: DISCORD_LINK,
            iconSVG: IMAGE_DISCORD, // If icon is a <SVG> inline component
            kind: MenuItemKind.EXTERNAL_LINK,
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
