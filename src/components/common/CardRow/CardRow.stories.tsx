import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Card } from '../Card/index'
import { CardRow, CardRowProps } from '.'

export default {
  title: 'Common/CardRow',
  component: CardRow,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<CardRowProps> = (args) => (
  <CardRow {...args}>
    <>
      <Card>
        <span>Card1</span>
      </Card>
      <Card>
        <span>Card2</span>
      </Card>
      <Card>
        <span>Card3</span>
      </Card>
      <Card>
        <span>Card4</span>
      </Card>
    </>
  </CardRow>
)

const defaultProps: CardRowProps = {}

export const Default = Template.bind({})
Default.args = { ...defaultProps }
