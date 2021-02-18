import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { OrderWidgetView, Props } from './view'

import { ORDER } from '../../../../../test/data'

export default {
  title: 'Explorer/OrderWidget',
  component: OrderWidgetView,
  decorators: [GlobalStyles, ThemeToggler],
  //   argTypes: { header: { control: null }, children: { control: null } },
} as Meta

const Template: Story<Props> = (args) => <OrderWidgetView {...args} />

const defaultProps: Props = { order: null, isLoading: false }

export const OrderFound = Template.bind({})
OrderFound.args = { ...defaultProps, order: ORDER }

export const OrderLoading = Template.bind({})
OrderLoading.args = { ...defaultProps, isLoading: true }

export const OrderNotFound = Template.bind({})
OrderNotFound.args = { ...defaultProps }
