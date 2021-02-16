import React from 'react'
import Tabs, { getTabTheme, TabItemInterface } from 'components/common/Tabs/Tabs'
import { OrdersWidgetDemo as Wrapper } from './OrdersWidgetDemo.styled'
import { ActiveOrdersContent } from './ActiveOrdersContent'

const tabItems: TabItemInterface[] = [
  {
    id: 1,
    tab: 'Active Orders: ' + 5,
    content: <ActiveOrdersContent />,
  },
  {
    id: 2,
    tab: 'Order History: ' + 10,
    content: <ActiveOrdersContent />,
  },
  {
    id: 3,
    tab: 'Closed Orders: ' + 21,
    content: 'content',
  },
]

// Provide a custom theme
const tabThemeConfig = getTabTheme({
  activeBg: 'var(--color-primary)',
  activeText: 'var(--color-text-primary)',
  inactiveBg: 'var(--color-transparent)',
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: 'none',
  fontWeight: 'var(--font-weight-normal)',
  fontSize: 'var(--font-size-default)',
  letterSpacing: '0.03rem',
})

const OrdersWidgetDemo: React.FC = () => {
  return (
    <Wrapper>
      <Tabs tabItems={tabItems} tabTheme={tabThemeConfig} />
    </Wrapper>
  )
}

export default OrdersWidgetDemo
