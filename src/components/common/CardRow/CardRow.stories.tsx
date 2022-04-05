import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Card, CardContent } from 'components/common/Card'
import { CardRow, CardRowProps } from '.'

import QuestionIcon from '../../../assets/img/question1.svg'

export default {
  title: 'Common/CardRow',
  component: CardRow,
  decorators: [GlobalStyles, ThemeToggler],
} as Meta

const Template: Story<CardRowProps> = (args) => (
  <CardRow {...args}>
    <>
      <Card>
        <CardContent variant="2row" label1="24h Transactions" value1="194" caption1="-3.45%" captionColor="red1" />
      </Card>
      <Card>
        <CardContent
          icon1={<img src={QuestionIcon} />}
          variant="3row"
          label1="24h Transactions"
          value1="194"
          caption1="-3.45%"
          captionColor="red1"
        />
      </Card>
      <Card>
        <CardContent
          variant="3row"
          label1="Trades"
          value1="511.12k"
          caption1="0.588ETH"
          hint1="(~$1015.01)"
          captionColor="white"
          hintColor="grey"
        />
      </Card>
      <Card>
        <span>Dummy Card</span>
      </Card>
      <Card>
        <CardContent
          variant="double"
          direction="row"
          valueSize={14}
          labelWidth={110}
          label1="Limit Price"
          value1="1055.32 DAI per ETH"
          label2="Avg. Exec. Price"
          value2="1055.54 DAI per ETH"
        />
      </Card>
    </>
  </CardRow>
)

const defaultProps: CardRowProps = {}

export const Default = Template.bind({})
Default.args = { ...defaultProps }
