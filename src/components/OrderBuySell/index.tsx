import React from 'react'
import styled from 'styled-components'
import Tabs, { getTabTheme, TabItemInterface } from 'components/common/Tabs/Tabs'

const tabItems: TabItemInterface[] = [
  {
    id: 1,
    tab: 'BUY',
    content: '- buy component -',
  },
  {
    id: 2,
    tab: 'SELL',
    content: '- sell component -',
  },
]

const tabThemeConfig = getTabTheme({
  activeBg: 'var(--color-long)',
  activeBgAlt: 'var(--color-short)',
  inactiveBg: 'var(--color-primary)',
  activeText: 'var(--color-primary)',
  inactiveText: 'var(--color-primary2)',
  activeBorder: 'none',
  fontSize: 'var(--font-size-large)',
  fontWeight: 'var(--font-weight-bold)',
  borderRadius: true,
})

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  padding: var(--padding-container-default);
`

const OrderBuySell: React.FC = () => (
  <Wrapper>
    <Tabs tabItems={tabItems} tabTheme={tabThemeConfig} />
  </Wrapper>
)

export default OrderBuySell
