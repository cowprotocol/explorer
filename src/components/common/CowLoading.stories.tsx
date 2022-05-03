import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import CowLoading from './CowLoading'

export default {
  title: 'Common/CowLoading',
  component: CowLoading,
} as Meta

const Template: Story = () => <CowLoading />

export const Default = Template.bind({})
