import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { faExchangeAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'

import { Order } from 'api/operator'

import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { getOrderLimitPrice, formatCalculatedPriceToDisplay, formattedAmount, FormatAmountPrecision } from 'utils'
import { getShortOrderId } from 'utils/operator'
import { HelpTooltip } from 'components/Tooltip'
import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'
import Icon from 'components/Icon'
import TradeOrderType from 'components/common/TradeOrderType'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { StatusLabel } from 'components/orders/StatusLabel'
import { media } from 'theme/styles/media'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { useNetworkId } from 'state/network'
import { safeTokenName } from '@gnosis.pm/dex-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 12rem 7rem repeat(2, minmax(16rem, 1.5fr)) 12rem repeat(2, minmax(18rem, 2fr)) 1fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  ${media.desktopMediumDown} {
    > thead > tr {
      display: none;
    }
    > tbody > tr {
      grid-template-columns: none;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 16px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }
    }
    tr > td {
      display: flex;
      flex: 1;
      width: 100%;
      justify-content: space-between;
      margin: 0;
      margin-bottom: 18px;
      min-height: 32px;
      span.span-inside-tooltip {
        align-items: flex-end;
        flex-direction: column;
        img {
          margin-left: 0;
        }
      }
    }
    .header-value {
      flex-wrap: wrap;
      text-align: end;
    }
    .span-copybtn-wrap {
      display: flex;
      flex-wrap: nowrap;
      span {
        display: flex;
        align-items: center;
      }
      .copy-text {
        margin-left: 5px;
      }
    }
  }
  overflow: auto;
`

const HeaderTitle = styled.span`
  display: none;
  ${media.desktopMediumDown} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`
const HeaderValue = styled.span`
  ${media.desktopMediumDown} {
    flex-wrap: wrap;
    text-align: end;
  }
`

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
  orders: Order[] | undefined
}

interface RowProps {
  order: Order
  isPriceInverted: boolean
  invertLimitPrice: () => void
}

const RowTransaction: React.FC<RowProps> = ({ order, isPriceInverted, invertLimitPrice }) => {
  const {
    buyToken,
    buyAmount,
    creationDate,
    partiallyFilled = false,
    sellToken,
    sellAmount,
    kind,
    txHash,
    shortId,
    uid,
    surplusAmount,
  } = order
  const network = useNetworkId()
  const buyTokenSymbol = buyToken ? safeTokenName(buyToken) : ''
  const sellTokenSymbol = sellToken ? safeTokenName(sellToken) : ''
  const sellFormattedAmount = formattedAmount(sellToken, sellAmount)
  const buyFormattedAmount = formattedAmount(buyToken, buyAmount)
  const renderSpinnerWhenNoValue = (textValue: string): JSX.Element | void => {
    if (textValue === '-') return <FontAwesomeIcon icon={faSpinner} spin size="1x" />
  }
  const limitPriceSettled = getLimitPrice(order, isPriceInverted)

  return (
    <tr key={txHash}>
      <td>
        <HeaderTitle>
          Order ID <HelpTooltip tooltip={tooltip.orderID} />
        </HeaderTitle>
        <HeaderValue>
          <RowWithCopyButton
            className="span-copybtn-wrap"
            textToCopy={uid}
            contentsToDisplay={
              <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
                {getShortOrderId(shortId)}
              </LinkWithPrefixNetwork>
            }
          />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Type</HeaderTitle>
        <span className="header-value">
          <TradeOrderType kind={kind || 'sell'} />
        </span>
      </td>
      <td>
        <HeaderTitle>Sell Amount</HeaderTitle>
        <HeaderValue>
          {renderSpinnerWhenNoValue(sellFormattedAmount) || (
            <TextWithTooltip textInTooltip={`${sellFormattedAmount} ${sellTokenSymbol}`}>
              {formattedAmount(sellToken, sellAmount, FormatAmountPrecision.highPrecision)}{' '}
              {sellToken && network && <TokenDisplay showAbbreviated erc20={sellToken} network={network} />}
            </TextWithTooltip>
          )}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Buy amount</HeaderTitle>
        <HeaderValue>
          {renderSpinnerWhenNoValue(buyFormattedAmount) || (
            <TextWithTooltip textInTooltip={`${buyFormattedAmount} ${buyTokenSymbol}`}>
              {formattedAmount(buyToken, buyAmount, FormatAmountPrecision.highPrecision)}{' '}
              {buyToken && network && <TokenDisplay showAbbreviated erc20={buyToken} network={network} />}
            </TextWithTooltip>
          )}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>
          Limit price
          <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
        </HeaderTitle>
        <HeaderValue>{renderSpinnerWhenNoValue(limitPriceSettled) || limitPriceSettled}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Surplus</HeaderTitle>
        <HeaderValue>
          {!surplusAmount.isZero() ? <OrderSurplusDisplay amountLikeTooltip order={order} /> : '-'}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Created</HeaderTitle>
        <HeaderValue>
          <DateDisplay date={creationDate} showIcon={true} />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Status</HeaderTitle>
        <HeaderValue>
          <StatusLabel status={order.status} partiallyFilled={partiallyFilled} />
        </HeaderValue>
      </td>
    </tr>
  )
}

const TransactionTable: React.FC<Props> = (props) => {
  const { orders, showBorderTable = false } = props
  const [isPriceInverted, setIsPriceInverted] = useState(false)
  useEffect(() => {
    setIsPriceInverted(isPriceInverted)
  }, [isPriceInverted])
  const invertLimitPrice = (): void => {
    setIsPriceInverted((previousValue) => !previousValue)
  }

  const orderItems = (items: Order[] | undefined): JSX.Element => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>
              Can&apos;t load details <br /> Please try again
            </EmptyItemWrapper>
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          {items.map((item, i) => (
            <RowTransaction
              key={`${item.shortId}-${i}`}
              invertLimitPrice={invertLimitPrice}
              order={item}
              isPriceInverted={isPriceInverted}
            />
          ))}
        </>
      )
    }
    return tableContent
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
          <th>Sell Amount</th>
          <th>Buy Amount</th>
          <th>
            Limit price <Icon icon={faExchangeAlt} onClick={invertLimitPrice} />
          </th>
          <th>Surplus</th>
          <th>Created</th>
          <th>Status</th>
        </tr>
      }
      body={orderItems(orders)}
    />
  )
}

export default TransactionTable
