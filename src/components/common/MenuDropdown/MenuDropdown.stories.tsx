import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import MenuDropdown, { MenuProps } from '.'
// import { ExternalLink } from 'components/analytics/ExternalLink'

/* import IMAGE_DOCS from 'assets/cow-swap/doc.svg'
import IMAGE_INFO from 'assets/cow-swap/info.svg'
import IMAGE_CODE from 'assets/cow-swap/code.svg'
import IMAGE_DISCORD from 'assets/cow-swap/discord.svg'
import IMAGE_TWITTER from 'assets/cow-swap/twitter.svg'
import IMAGE_PIE from 'assets/cow-swap/pie.svg' */

import IMAGE_CARRET_DOWN from 'assets/img/carret-down.svg'

export default {
  title: 'Common/Menu',
  component: MenuDropdown,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

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
          /* icon?: 'IMAGE_CARRET_DOWN', // If icon uses a regular <img /> tag */
          iconSVG: IMAGE_CARRET_DOWN, // If icon is a <SVG> inline component
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

const Template: Story<MenuProps> = (args) => (
  <div>
    <MenuDropdown itemContent={itemContent} {...args} />
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
