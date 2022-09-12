import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler, Router } from 'storybook/decorators'

import MenuDropdown, { DropdownProps } from '.'
import { DropDownItem, MenuItemKind } from './types'

import { DOCS_LINK, DISCORD_LINK, PROTOCOL_LINK, DUNE_DASHBOARD_LINK, Routes } from 'apps/explorer/const'
import IMAGE_COW from 'assets/img/CowProtocol-logo.svg'
import IMAGE_DISCORD from 'assets/img/discord.svg'
import IMAGE_DOC from 'assets/img/doc.svg'
import IMAGE_ANALYTICS from 'assets/img/pie.svg'
import IMAGE_APPDATA from 'assets/img/code.svg'

export default {
  title: 'Common/Menu',
  component: MenuDropdown,
  decorators: [Router, GlobalStyles, ThemeToggler],
} as Meta

const DropdownMenu: DropDownItem = {
  kind: MenuItemKind.DROP_DOWN,
  title: 'Dropdown menu',
  items: [
    {
      sectionTitle: 'OVERVIEW',
      links: [
        {
          title: 'CoW Protocol',
          url: PROTOCOL_LINK,
          kind: MenuItemKind.EXTERNAL_LINK,
          iconSVG: IMAGE_COW,
        },
        {
          title: 'Documentation',
          url: DOCS_LINK,
          kind: MenuItemKind.EXTERNAL_LINK,
          iconSVG: IMAGE_DOC,
        },
        {
          title: 'Analytics',
          url: DUNE_DASHBOARD_LINK,
          kind: MenuItemKind.EXTERNAL_LINK,
          iconSVG: IMAGE_ANALYTICS,
        },
      ],
    },
    {
      sectionTitle: 'COMMUNITY',
      links: [
        {
          title: 'Discord',
          url: DISCORD_LINK,
          iconSVG: IMAGE_DISCORD,
          kind: MenuItemKind.EXTERNAL_LINK,
        },
      ],
    },
    {
      sectionTitle: 'OTHER',
      links: [
        {
          title: 'AppData',
          url: Routes.APPDATA,
          iconSVG: IMAGE_APPDATA,
        },
      ],
    },
  ],
}

const Template: Story<DropdownProps> = (args) => (
  <>
    <MenuDropdown menuItem={DropdownMenu} {...{ context: args.context }} />
  </>
)

const defaultProps: Omit<DropdownProps, 'menuItem'> = {
  context: { isMobileMenuOpen: false, handleMobileMenuOnClick: () => console.log },
}

export const Default = Template.bind({})
Default.args = {
  ...defaultProps,
}
