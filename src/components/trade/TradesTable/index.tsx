import { Order } from 'api/operator'
import styled from 'styled-components'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'
import React from 'react'
import { SimpleTable } from '../../common/SimpleTable'
import TradesTableContext from './Context/TradesTableContext'
import { DateDisplay } from 'components/orders/DateDisplay'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { constructPrice } from 'utils'
import { BlockExplorerLink } from 'apps/explorer/components/common/BlockExplorerLink'

const Icon = styled(FontAwesomeIcon)`
  background: ${({ theme }): string => theme.grey}33; /* 33==20% transparency in hex */
  border-radius: 1rem;
  width: 2rem !important; /* FontAwesome sets it to 1em with higher specificity */
  height: 2rem;
  padding: 0.4rem;
  margin-left: 0.5rem;
  cursor: pointer;
`

export const TradesTableHeader = (): JSX.Element => {
  const tableContext = React.useContext(TradesTableContext)

  return (
    <tr>
      <th>Order Id</th>
      <th>Type</th>
      <th>Sell Amount</th>
      <th>Buy Amount</th>
      <th>
        Limit price
        <Icon icon={faExchangeAlt} onClick={tableContext.invertPrice} />
      </th>
      <th>
        Execution Price
        <Icon icon={faExchangeAlt} onClick={tableContext.invertPrice} />
      </th>
      <th>Tx Hash</th>
      <th>Surplus</th>
      <th>Trade Time</th>
    </tr>
  )
}

export type Props = {
  header?: JSX.Element
  className?: string
  numColumns?: number
  data: Array<Order>
}

const TitleUid = styled(RowWithCopyButton)`
  color: ${({ theme }): string => theme.grey};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: ${({ theme }): string => theme.fontNormal};
  display: flex;
  align-items: center;
`

export const TradesTable = ({ header, className, numColumns, data }: Props): JSX.Element => {
  const tableContext = React.useContext(TradesTableContext)
  const [rows, setRows] = React.useState([{}])

  React.useEffect((): void => {
    // for each entry in the data array invert the values of
    // the limit price and execution price if toggled
    const _rows: Array<
      Order & {
        limitPrice: string
        executionPrice: string
      }
    > = data.map((order): any => {
      return {
        ...order,
        limitPrice:
          order.buyToken && order.sellToken
            ? constructPrice({
                isPriceInverted: tableContext.isPriceInverted,
                order,
                data: {
                  numerator: {
                    amount: order.sellAmount,
                    token: order.sellToken,
                  },
                  denominator: {
                    amount: order.buyAmount,
                    token: order.buyToken,
                  },
                },
              })
            : '-',
        executionPrice:
          order.buyToken && order.sellToken
            ? constructPrice({
                isPriceInverted: tableContext.isPriceInverted,
                order,
                data: {
                  numerator: {
                    amount: order.buyAmount,
                    token: order.buyToken,
                  },
                  denominator: {
                    amount: order.sellAmount,
                    token: order.sellToken,
                  },
                },
              })
            : '-',
      }
    })
    setRows(_rows)
  }, [data, tableContext.isPriceInverted])

  return (
    <SimpleTable
      body={
        <>
          {rows.length > 0 &&
            rows.map(
              (order: Order & { limitPrice: string; executionPrice: string }, i) =>
                order.uid && (
                  <tr key={i}>
                    <td>
                      <TitleUid textToCopy={order.uid} contentsToDisplay={order.shortId} />
                    </td>
                    <td className={i % 2 === 1 ? 'long' : 'short'}>{i % 2 === 1 ? 'Buy' : 'Sell'}</td>
                    <td>
                      {order.sellToken?.decimals.toFixed(3)} {order.sellToken?.symbol}
                    </td>
                    <td>
                      {order.buyToken?.decimals.toFixed(3)} {order.buyToken?.symbol}
                    </td>
                    <td>{order.limitPrice}</td>
                    <td>{order.executionPrice}</td>
                    <td>
                      {order.txHash ? (
                        <RowWithCopyButton
                          textToCopy={order.txHash}
                          onCopy={(): void => console.log('settlementTx')}
                          contentsToDisplay={
                            <BlockExplorerLink
                              identifier={order.txHash}
                              type="tx"
                              label={`${
                                order.txHash.substr(0, 4) +
                                '...' +
                                order.txHash.substr(order.txHash.length - 5, order.txHash.length)
                              }`}
                            />
                          }
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{!order.surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
                    <td>
                      <DateDisplay date={order.creationDate} />
                    </td>
                  </tr>
                ),
            )}
        </>
      }
      numColumns={numColumns}
      header={header}
      className={className}
    />
  )
}
