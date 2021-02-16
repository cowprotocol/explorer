import React, { useMemo } from 'react'
import styled from 'styled-components'
import Tabs, { getTabTheme, TabItemInterface } from 'components/common/Tabs/Tabs'
import OrderBook from 'components/order-book/OrderBook'
import PairTradeHistory from 'components/PairTradeHistory'
import { OrderBookTradesStyled as Wrapper } from './OrderBookTrades.styled'
import { dummyOrders } from 'components/order-book/OrderBook/dummyTradingData'

const tabItems = (orders: OrderBookWidgetsProp['orders']): TabItemInterface[] => [
  {
    id: 1,
    tab: 'Orderbook',
    content: <OrderBook orders={orders} />,
  },
  {
    id: 2,
    tab: 'Trades',
    content: <PairTradeHistory />,
  },
]

// Provide a custom theme
const tabThemeConfig = getTabTheme({
  activeBg: 'var(--color-transparent)',
  inactiveBg: 'var(--color-transparent)',
  activeText: 'var(--color-text-primary)',
  inactiveText: 'var(--color-text-secondary2)',
  activeBorder: 'var(--color-text-primary)',
  inactiveBorder: 'var(--color-text-secondary2)',
  borderRadius: false,
  fontSize: 'var(--font-size-default)',
})

const TabsWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0;

  > div > div.tablist {
    background: var(--color-gradient-2);
    padding: calc(var(--padding-container-default) / 2) var(--padding-container-default)
      var(--padding-container-default);
    justify-content: flex-end;
  }

  > div > div.tablist > button {
    flex: 0 1 auto;
    padding: 0 0.8rem;
    line-height: 2;
    height: auto;
  }

  > div > div:last-of-type {
    height: calc(100% - 8.4rem);
  }
`

interface OrderBookWidgetsProp {
  readonly orders?: typeof dummyOrders
}

export const OrderBookTradesWidget: React.FC<OrderBookWidgetsProp> = ({ orders }) => {
  const tabsList = useMemo(() => tabItems(orders), [orders])

  return (
    <Wrapper>
      <TabsWrapper>
        <Tabs tabItems={tabsList} tabTheme={tabThemeConfig} />
      </TabsWrapper>
    </Wrapper>
  )
}

export default OrderBookTradesWidget
