import React from 'react'
import styled from 'styled-components'

import { formatSmart } from '@gnosis.pm/dex-js'

import { Order } from 'api/operator'

import { capitalize } from 'utils'

import { BlockExplorerLink } from 'apps/explorer/components/common/BlockExplorerLink'

import { SimpleTable } from 'components/common/SimpleTable'

import { StatusLabel } from 'components/orders/StatusLabel'
import { OrderPriceDisplay } from 'components/orders/OrderPriceDisplay'
import { DateDisplay } from 'components/orders/DateDisplay'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'

const Table = styled(SimpleTable)`
  border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.4rem;

  > tbody > tr {
    grid-template-columns: 16rem auto;

    > td {
      justify-content: flex-start;

      &:first-of-type {
        font-weight: var(--font-weight-bold);
        text-transform: capitalize;

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

export type Props = { order: Order }

export function DetailsTable(props: Props): JSX.Element | null {
  const { order } = props
  const {
    shortId,
    owner,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    expirationDate,
    buyAmount,
    sellAmount,
    executedBuyAmount,
    executedSellAmount,
    executedFeeAmount,
    status,
    filledAmount,
    surplusAmount,
    buyToken,
    sellToken,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  return (
    <Table
      body={
        <>
          <tr>
            <td>Order Id</td>
            <td>
              <RowWithCopyButton textToCopy={shortId} contentsToDisplay={shortId} />
            </td>
          </tr>
          <tr>
            <td>From</td>
            <td>
              <RowWithCopyButton
                textToCopy={owner}
                contentsToDisplay={<BlockExplorerLink identifier={owner} type="address" label={owner} />}
              />
            </td>
          </tr>
          {!partiallyFillable && (
            <tr>
              <td>Transaction hash</td>
              <td>
                {txHash ? (
                  <RowWithCopyButton
                    textToCopy={txHash}
                    contentsToDisplay={<BlockExplorerLink identifier={txHash} type="tx" label={txHash} />}
                  />
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>Status</td>
            <td>
              <StatusLabel status={status} />
            </td>
          </tr>
          <tr>
            <td>Submission Time</td>
            <td>
              <DateDisplay date={creationDate} />
            </td>
          </tr>
          <tr>
            <td>Expiration Time</td>
            <td>
              <DateDisplay date={expirationDate} />
            </td>
          </tr>
          <tr>
            <td>Type</td>
            <td>
              {capitalize(kind)} order {!partiallyFillable && '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>Sell amount</td>
            <td>{`${formatSmart(sellAmount.toString(), sellToken.decimals)} ${sellToken.symbol}`}</td>
          </tr>
          <tr>
            <td>Buy amount</td>
            <td>{`${formatSmart(buyAmount.toString(), buyToken.decimals)} ${buyToken.symbol}`}</td>
          </tr>
          <tr>
            <td>Limit Price</td>
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
          {!partiallyFillable && (
            <>
              <tr>
                <td>Execution price</td>
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
                <td>Order surplus</td>
                <td>{!surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
              </tr>
              <tr>
                <td>Gas Fees paid</td>
                <td>{formatSmart(executedFeeAmount.toString(), sellToken.decimals)}</td>
              </tr>
            </>
          )}
        </>
      }
    />
  )
}
