import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { FilledProgress, Props } from '.'

export default {
  title: 'Orders/FilledProgress',
  component: FilledProgress,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { percentage: { control: null } },
} as Meta

const Template: Story<Props> = (args) => <FilledProgress {...args} />

const defaultArgs: Props = {
  percentage: '40',
}

export const Default = Template.bind({})
Default.args = { ...defaultArgs }
