import React from 'react'
import { Story, Meta } from '@storybook/react'
import styled from 'styled-components'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'
import { VolumeChart, VolumeChartProps } from './VolumeChart'
import volumeDataJson from './volumeData.json'
import { buildVolumeData, VolumePeriod } from '.'

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

const WrapperVolumeChart = styled.div`
  height: 19.6rem;
`

const Template: Story<VolumeChartProps> = (args) => (
  <WrapperVolumeChart>
    <VolumeChart {...args} />
  </WrapperVolumeChart>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Test Chart (D)',
  volumeData: {
    ...buildVolumeData(volumeDataJson, VolumePeriod.YEARLY),
    isLoading: false,
  },
}
