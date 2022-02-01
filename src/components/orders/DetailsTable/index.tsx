import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { Order } from 'api/operator'

import { capitalize } from 'utils'

import { HelpTooltip } from 'components/Tooltip'

import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'

import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { DateDisplay } from 'components/common/DateDisplay'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { FilledProgress } from 'components/orders/FilledProgress'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { StatusLabel } from 'components/orders/StatusLabel'
import { GasFeeDisplay } from 'components/orders/GasFeeDisplay'
import { triggerEvent } from 'api/analytics'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'

const Table = styled(SimpleTable)`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.4rem;

  > tbody > tr {
    grid-template-columns: 27rem auto;
    padding: 1.4rem 0 1.4rem 1.1rem;

    ${media.mediumDown} {
      grid-template-columns: 17rem auto;
      padding: 1.4rem 0;
    }

    > td {
      justify-content: flex-start;

      &:first-of-type {
        text-transform: capitalize;
        ${media.mediumUp} {
          font-weight: ${({ theme }): string => theme.fontLighter};
        }

        /* Question mark */
        > svg {
          margin: 0 1rem 0 0;
        }

        /* Column after text on first column */
        ::after {
          content: ':';
        }
      }

      &:last-of-type {
        color: ${({ theme }): string => theme.textPrimary1};
      }
    }
  }
`

const tooltip = {
  orderID: 'A unique identifier ID for this order.',
  from: 'The account address which signed the order.',
  to: 'The account address which will/did receive the bought amount.',
  hash: 'The onchain settlement transaction for this order. Can be viewed on Etherscan.',
  status: 'The order status is either Open, Filled, Expired or Canceled.',
  submission:
    'The date and time at which the order was submitted. The timezone is based on the browser locale settings.',
  expiration:
    'The date and time at which an order will expire and effectively be cancelled. Depending on the type of order, it may have partial fills upon expiration.',
  type: 'An order can be either a Buy or Sell order. In addition, an order may be of type "Fill or Kill" (no partial fills) or a regular order (partial fills allowed).',
  amount: 'The total sell and buy amount for this order.',
  priceLimit:
    'The limit price is the price at which this order shall be (partially) filled, in combination with the specified slippage.',
  priceExecution: 'The actual price at which this order has been matched and executed.',
  surplus:
    'The (averaged) surplus for this order. This is the positive difference between the initial limit price and the actual (average) execution price.',
  filled: 'Indicates what percentage amount this order has been filled and the amount sold/bought.',
  fees: 'The amount of fees paid for this order. This will show a progressive number for orders with partial fills.',
}

export type Props = {
  order: Order
  areTradesLoading: boolean
}

export function DetailsTable(props: Props): JSX.Element | null {
  const { order, areTradesLoading } = props
  const {
    uid,
    shortId,
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    expirationDate,
    buyAmount,
    sellAmount,
    executedBuyAmount,
    executedSellAmount,
    status,
    partiallyFilled,
    filledAmount,
    surplusAmount,
    buyToken,
    sellToken,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const onCopy = (label: string): void =>
    triggerEvent({
      category: 'Order details',
      action: 'Copy',
      label,
    })

  return (
    <Table
      body={
        <>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.orderID} /> Order Id
            </td>
            <td>
              <RowWithCopyButton textToCopy={uid} contentsToDisplay={shortId} onCopy={(): void => onCopy('orderId')} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.from} /> From
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={owner}
                onCopy={(): void => onCopy('ownerAddress')}
                contentsToDisplay={<LinkWithPrefixNetwork to={`/address/${owner}`}>{owner}</LinkWithPrefixNetwork>}
              />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.to} /> To
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={receiver}
                onCopy={(): void => onCopy('receiverAddress')}
                contentsToDisplay={
                  <LinkWithPrefixNetwork to={`/address/${receiver}`}>{receiver}</LinkWithPrefixNetwork>
                }
              />
            </td>
          </tr>
          {!partiallyFillable && (
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.hash} /> Transaction hash
              </td>
              <td>
                {areTradesLoading ? (
                  <Spinner />
                ) : txHash ? (
                  <RowWithCopyButton
                    textToCopy={txHash}
                    onCopy={(): void => onCopy('settlementTx')}
                    contentsToDisplay={<LinkWithPrefixNetwork to={`/tx/${txHash}`}>{txHash}</LinkWithPrefixNetwork>}
                  />
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.status} /> Status
            </td>
            <td>
              <StatusLabel status={status} partiallyFilled={partiallyFilled} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.submission} /> Submission Time
            </td>
            <td>
              <DateDisplay date={creationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.expiration} /> Expiration Time
            </td>
            <td>
              <DateDisplay date={expirationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.type} /> Type
            </td>
            <td>
              {capitalize(kind)} order {!partiallyFillable && '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.amount} />
              Amount
            </td>
            <td>
              <AmountsDisplay order={order} />
            </td>
          </tr>
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.priceLimit} /> Limit Price
            </td>
            <td>
              <OrderPriceDisplay
                buyAmount={buyAmount}
                buyToken={buyToken}
                sellAmount={sellAmount}
                sellToken={sellToken}
                showInvertButton
              />
            </td>
          </tr>
          {/*TODO: uncomment when fills tab is implemented */}
          {/*{!partiallyFillable && (*/}
          <>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.priceExecution} /> Execution price
              </td>
              <td>
                {!filledAmount.isZero() ? (
                  <OrderPriceDisplay
                    buyAmount={executedBuyAmount}
                    buyToken={buyToken}
                    sellAmount={executedSellAmount}
                    sellToken={sellToken}
                    showInvertButton
                  />
                ) : (
                  '-'
                )}
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.filled} /> Filled
              </td>
              <td>
                <FilledProgress order={order} />
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip.surplus} /> Order surplus
              </td>
              <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
            </tr>
          </>
          {/*TODO: uncomment when fills tab is implemented */}
          {/*)}*/}
          <tr>
            <td>
              <HelpTooltip tooltip={tooltip.fees} /> Fees
            </td>
            <td>
              <GasFeeDisplay order={order} />
            </td>
          </tr>
        </>
      }
    />
  )
}
