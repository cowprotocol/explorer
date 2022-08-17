import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import MenuDropdown, { MenuProps } from '.'
// import { ExternalLink } from 'components/analytics/ExternalLink'

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
          title: 'Overview',
          url: 'https://cow.fi',
          /* icon?: string, // If icon uses a regular <img /> tag */
          /*  iconSVG?: string // If icon is a <SVG> inline component */
        },
        {
          title: 'Overview2',
          url: 'https://cow.fi',
        },
        {
          title: 'Overview3',
          url: 'https://cow.fi',
        },
      ],
    },
  ],
}

const Template: Story<MenuProps> = (args) => (
  <div>
    <MenuDropdown itemContent={itemContent} {...args} />
    {/* <li>
        <ExternalLink target={'_blank'} href={'https://cow.fi'}>
          CoW Protocol
        </ExternalLink>
      </li>
      <li>
        <ExternalLink target={'_blank'} href={'https://docs.cow.fi'}>
          Documentation
        </ExternalLink>
      </li>
      <li>
        <ExternalLink target={'_blank'} href={'https://dune.xyz/gnosis.protocol/Gnosis-Protocol-V2'}>
          Analytics
        </ExternalLink>
      </li>
      <li>
        <ExternalLink target={'_blank'} href={'https://discord.gg/cowprotocol'}>
          Discord
        </ExternalLink>
      </li>
      <li>
        <a>App Data</a>
      </li> */}
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
