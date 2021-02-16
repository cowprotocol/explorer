import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { StatusLabel, Props } from '.'

export default {
  title: 'Orders/StatusLabel',
  component: StatusLabel,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<Props> = (args) => <StatusLabel {...args} />

export const Expired = Template.bind({})
Expired.args = { status: 'expired' }

export const Filled = Template.bind({})
Filled.args = { status: 'filled' }
export const PartiallyFilled = Template.bind({})
PartiallyFilled.args = { status: 'partially filled' }
export const Open = Template.bind({})
Open.args = { status: 'open' }
