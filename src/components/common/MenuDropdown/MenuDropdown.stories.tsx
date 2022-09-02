import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import MenuDropdown, { MenuProps } from '.'
import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
// import { ExternalLink } from 'components/analytics/ExternalLink'

/* import IMAGE_DOCS from 'assets/cow-swap/doc.svg'
import IMAGE_INFO from 'assets/cow-swap/info.svg'
import IMAGE_CODE from 'assets/cow-swap/code.svg'
import IMAGE_DISCORD from 'assets/cow-swap/discord.svg'
import IMAGE_TWITTER from 'assets/cow-swap/twitter.svg'
import IMAGE_PIE from 'assets/cow-swap/pie.svg' */

// import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'

export default {
  title: 'Common/Menu',
  component: MenuDropdown,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const menuContent = [
  {
    title: 'Home',
    items: [],
    kind: 'INTERNAL_LINK',
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
            // iconSVG: IMAGE_DISCORD, // If icon is a <SVG> inline component
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

const Template: Story<MenuProps> = () => (
  <div>
    <MenuDropdown menuContent={menuContent} />
  </div>
)

const defaultProps: MenuProps = {
  title: '',
  children: undefined,
}

export const Default = Template.bind({})
Default.args = {
  ...defaultProps,
}
