import React, { useState } from 'react'
import styled from 'styled-components'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'

import { Trade, RawOrder } from 'api/operator'

import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import {
  getOrderLimitPrice,
  getOrderExecutedPrice,
  formatCalculatedPriceToDisplay,
  formatExecutedPriceToDisplay,
  formattedAmount,
} from 'utils'
import { getShortOrderId } from 'utils/operator'
import { HelpTooltip } from 'components/Tooltip'
import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'
import Icon from 'components/Icon'
import TradeOrderType from 'components/common/TradeOrderType'
import { Surplus } from './Surplus'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 10rem 10rem 4rem repeat(2, 10rem) repeat(2, 14rem) 10rem 1fr;
  }
`

const TxHash = styled.div`
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

function getLimitPrice(trade: Trade, isPriceInverted: boolean): string {
  if (!trade.buyToken || !trade.sellToken) return '-'

  const calculatedPrice = getOrderLimitPrice({
    buyAmount: trade.buyAmount,
    sellAmount: trade.sellAmount,
    buyTokenDecimals: trade.buyToken.decimals,
    sellTokenDecimals: trade.sellToken.decimals,
    inverted: isPriceInverted,
  })

  return formatCalculatedPriceToDisplay(calculatedPrice, trade.buyToken, trade.sellToken, isPriceInverted)
}

function getExecutedPrice(trade: Trade, isPriceInverted: boolean): string {
  if (!trade.buyToken || !trade.sellToken) return '-'

  const order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmount' | 'executedFeeAmount'> = {
    executedBuyAmount: trade.executedBuyAmount?.toString() || '',
    executedSellAmount: trade.executedSellAmount?.toString() || '',
    executedFeeAmount: trade.executedFeeAmount?.toString() || '',
  }

  const calculatedPrice = getOrderExecutedPrice({
    order,
    buyTokenDecimals: trade.buyToken.decimals,
    sellTokenDecimals: trade.sellToken.decimals,
    inverted: isPriceInverted,
  })

  return formatExecutedPriceToDisplay(calculatedPrice, trade.buyToken, trade.sellToken, isPriceInverted)
}

const tooltip = {
  tradeID: 'A unique identifier ID for this trade.',
}

export type Props = StyledUserDetailsTableProps & {
  trades: Trade[]
}

interface RowProps {
  trade: Trade
  isPriceInverted: boolean
}

const RowOrder: React.FC<RowProps> = ({ trade, isPriceInverted }) => {
  const { executionTime, buyToken, buyAmount, sellToken, sellAmount, kind, orderId } = trade

  return (
    <tr key={orderId}>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={orderId}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/orders/${trade.orderId}`} rel="noopener noreferrer" target="_blank">
              {getShortOrderId(orderId)}
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={trade.txHash}
          contentsToDisplay={
            <BlockExplorerLink
              identifier={trade.txHash}
              type="tx"
              label={<TxHash>{trade.txHash}</TxHash>}
              networkId={1}
            />
          }
        />
      </td>
      <td>
        <TradeOrderType kind={kind || 'sell'} />
      </td>
      <td>
        {formattedAmount(sellToken, sellAmount)} {sellToken?.symbol}
      </td>
      <td>
        {formattedAmount(buyToken, buyAmount)} {buyToken?.symbol}
      </td>
      <td>{getLimitPrice(trade, isPriceInverted)}</td>
      <td>{getExecutedPrice(trade, isPriceInverted)}</td>
      <td>
        {trade.surplusPercentage && trade.surplusAmount && (
          <Surplus surplusPercentage={trade.surplusPercentage} surplusAmount={trade.surplusAmount} />
        )}
      </td>
      <td>
        <DateDisplay date={executionTime} showIcon={true} />
      </td>
    </tr>
  )
}

const TradesTable: React.FC<Props> = (props) => {
  const { trades, showBorderTable = false } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const tradeItems = (items: Trade[]): JSX.Element => {
    if (items.length === 0) return <EmptyItemWrapper>No Trades.</EmptyItemWrapper>

    return (
      <>
        {items.map((item) => (
          <RowOrder key={item.orderId} trade={item} isPriceInverted={isPriceInverted} />
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
            Order ID <HelpTooltip tooltip={tooltip.tradeID} />
          </th>
          <th>TxHash</th>
          <th>Type</th>
          <th>Sell Amount</th>
          <th>Buy Amount</th>
          <th>
            Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
          </th>
          <th>
            Execution price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
          </th>
          <th>Surplus</th>
          <th>Trade Time</th>
        </tr>
      }
      body={tradeItems(trades)}
    />
  )
}

export default TradesTable
