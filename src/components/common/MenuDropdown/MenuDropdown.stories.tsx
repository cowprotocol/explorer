import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import MenuDropdown, { DropdownProps } from '.'
import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
import { DropDownItem, MenuItemKind } from './types'
import IMAGE_DISCORD from 'assets/img/discord.svg'

export default {
  title: 'Common/Menu',
  component: MenuDropdown,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const menuContentDropdown: DropDownItem = {
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
}

const Template: Story<DropdownProps> = (args) => (
  <div>
    <MenuDropdown menuItem={menuContentDropdown} {...{ context: args.context }} />
  </div>
)

const defaultProps: Omit<DropdownProps, 'menuItem'> = {
  context: { isMobileMenuOpen: false, handleMobileMenuOnClick: () => console.log },
}

export const Default = Template.bind({})
Default.args = {
  ...defaultProps,
}
