import React from 'react'
import { Story, Meta } from '@storybook/react'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { VolumeChart, VolumeChartProps } from './VolumeChart'

export default {
  title: 'ExplorerApp/Chart',
  component: VolumeChart,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'default' },
    size: { control: 'default' },
    as: { control: null },
    theme: { control: null },
    forwardedAs: { control: null },
  },
} as Meta

// const Template: Story<ButtonBaseProps & { label?: React.ReactNode }> = (args) => (
//   <ButtonBase {...args}>{args.label}</ButtonBase>
// )

// export const PrimaryButton = Template.bind({})
// PrimaryButton.args = {
//   label: 'Main Button',
//   variant: 'default',
// }

const Template: Story<VolumeChartProps> = (args) => <VolumeChart {...args} />

export const Default = Template.bind({})
Default.args = { title: 'Juee' }
