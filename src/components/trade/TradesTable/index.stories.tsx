import React from 'react'
import styled from 'styled-components'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { GlobalStyles, ThemeToggler } from 'storybook/decorators'

import { Props } from '.'
import { TradesTable, TradesTableHeader } from '.'
import TradesTableContext from './Context/TradesTableContext'

export default {
  title: 'Trade/TradesTable',
  component: TradesTable,
  decorators: [GlobalStyles, ThemeToggler],
  argTypes: { header: { control: null }, children: { control: null }, Component: { control: null } },
} as Meta

const Template: Story<Props & { Component?: typeof TradesTable }> = (args): JSX.Element => {
  const { Component = TradesTable, ...rest } = args
  const [isPriceInverted, invertPrice] = React.useState(false)

  return (
    <div style={{ overflowX: 'auto' }}>
      <TradesTableContext.Provider
        value={{
          isPriceInverted: isPriceInverted,
          invertPrice: (): void => invertPrice(!isPriceInverted),
        }}
      >
        <Component {...rest} />
      </TradesTableContext.Provider>
    </div>
  )
}

const BasicTable = styled(TradesTable)`
  tr > td {
    &:not(:first-of-type) {
      text-align: left;
    }
    &:nth-child(2) {
      min-width: 800px !important;
    }
  }

  > thead > tr,
  > tbody > tr {
    grid-template-columns: 15rem repeat(7, [col-start] minmax(200px, 1fr) [col-end]) 10rem;
  }

  thead tr th,
  tbody tr td {
    padding: 2px 5px 2px 5px !important;
  }

  thead {
    border-bottom: 1px solid rgba(141, 141, 169, 0.1);
    padding-bottom: 10px;
    &tr th {
      font-style: normal;
      font-weight: 800;
      font-size: 13px;
      line-height: 18px;
      display: flex;
      align-items: center;
    }
  }

  tbody tr:hover {
    backdrop-filter: contrast(0.9);
  }
`
export const BasicTradesTable = Template.bind({})
BasicTradesTable.args = {
  Component: BasicTable,
  header: <TradesTableHeader />,
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
}
