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

export const Filled = Template.bind({})
Filled.args = { status: 'filled' }

export const Expired = Template.bind({})
Expired.args = { status: 'expired' }

export const Cancelled = Template.bind({})
Cancelled.args = { status: 'cancelled' }

export const Open = Template.bind({})
Open.args = { status: 'open' }

export const Signing = Template.bind({})
Signing.args = { status: 'signing' }

export const OpenPartiallyFilled = Template.bind({})
OpenPartiallyFilled.args = { status: 'open', partiallyFilled: true }
export const ExpiredPartiallyFilled = Template.bind({})
ExpiredPartiallyFilled.args = { status: 'expired', partiallyFilled: true }
export const CancelledPartiallyFilled = Template.bind({})
CancelledPartiallyFilled.args = { status: 'cancelled', partiallyFilled: true }
