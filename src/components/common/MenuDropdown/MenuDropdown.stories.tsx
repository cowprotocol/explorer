import React from 'react'
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Menu, MenuProps } from '.'
import { ExternalLink } from 'components/analytics/ExternalLink'

export default {
  title: 'Common/Menu',
  component: Menu,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<MenuProps> = (args) => (
  <div>
    <Menu {...args}>
      <li>
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
      </li>
    </Menu>
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
