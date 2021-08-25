import React, { useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Link } from 'react-router-dom'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Order } from 'api/operator'

import { DateDisplay } from 'components/orders/DateDisplay'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'
import { formatSmartMaxPrecision, getOrderLimitPrice, formatCalculatedPriceToDisplay } from 'utils'
import { StatusLabel } from '../StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import StyledUserDetailsTable, { StyledUserDetailsTableProps, EmptyItemWrapper } from './styled'
import Icon from 'components/Icon'
import TradeOrderType from 'components/common/TradeOrderType'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 12rem 7rem repeat(2, 16rem) repeat(2, minmax(18rem, 24rem)) 1fr;
  }
`
function isTokenErc20(token: TokenErc20 | null | undefined): token is TokenErc20 {
  return (token as TokenErc20).address !== undefined
}

function formattedAmount(erc20: TokenErc20 | null | undefined, amount: BigNumber): string {
  if (!isTokenErc20(erc20)) return '-'

  return erc20.decimals ? formatSmartMaxPrecision(amount, erc20) : amount.toString(10)
}

function getLimitPrice(order: Order, isPriceInverted: boolean): string {
  if (!order.buyToken || !order.sellToken) return '-'

  const calculatedPrice = getOrderLimitPrice({
    buyAmount: order.buyAmount,
    sellAmount: order.sellAmount,
    buyTokenDecimals: order.buyToken.decimals,
    sellTokenDecimals: order.sellToken.decimals,
    inverted: isPriceInverted,
  })

  return formatCalculatedPriceToDisplay(calculatedPrice, order.buyToken, order.sellToken, isPriceInverted)
}

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
}

export type Props = StyledUserDetailsTableProps & {
  orders: Order[]
}

interface RowProps {
  order: Order
  isPriceInverted: boolean
}

const RowOrder: React.FC<RowProps> = ({ order, isPriceInverted }) => {
  const { creationDate, buyToken, buyAmount, sellToken, sellAmount, kind, partiallyFilled, shortId, uid } = order

  return (
    <tr key={shortId}>
      <td>
        {
          <RowWithCopyButton
            className="wrap-copybtn"
            textToCopy={uid}
            contentsToDisplay={<Link to={`/orders/${order.uid}`}>{shortId}</Link>}
          />
        }
      </td>
      <td>
        <TradeOrderType kind={kind} />
      </td>
      <td>
        {formattedAmount(sellToken, sellAmount.plus(order.feeAmount))} {sellToken?.symbol}
      </td>
      <td>
        {formattedAmount(buyToken, buyAmount)} {buyToken?.symbol}
      </td>
      <td>{getLimitPrice(order, isPriceInverted)}</td>
      <td>
        <DateDisplay date={creationDate} showIcon={true} />
      </td>
      <td>
        <StatusLabel status={order.status} partiallyFilled={partiallyFilled} />
      </td>
    </tr>
  )
}

const OrdersUserDetailsTable: React.FC<Props> = (props) => {
  const { orders, showBorderTable = false } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const orderItems = (items: Order[]): JSX.Element => {
    if (items.length === 0) return <EmptyItemWrapper>No Orders.</EmptyItemWrapper>

    return (
      <>
        {items.map((item) => (
          <RowOrder key={item.shortId} order={item} isPriceInverted={isPriceInverted} />
        ))}
      </>
    )
  }

  return (
    <Wrapper
      showBorderTable={showBorderTable}
      header={
        <tr>
          <th>
            Order ID <HelpTooltip tooltip={tooltip.orderID} />
          </th>
          <th>Type</th>
          <th>Sell amount</th>
          <th>Buy amount</th>
          <th>
            Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
          </th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orderItems(orders)}
    />
  )
}

export default OrdersUserDetailsTable
