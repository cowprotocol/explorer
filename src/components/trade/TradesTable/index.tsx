import { Order } from 'api/operator'
import styled from 'styled-components'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'
import React from 'react'
// import styled from 'styled-components'
// import { media } from 'theme/styles/media'
import { SimpleTable } from '../../common/SimpleTable'
import TradesTableContext from './Context/TradesTableContext'
import { DateDisplay } from 'components/orders/DateDisplay'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { calculatePrice, formatSmart, invertPrice, safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'
import {
  HIGH_PRECISION_DECIMALS,
  HIGH_PRECISION_SMALL_LIMIT,
  NO_ADJUSTMENT_NEEDED_PRECISION,
} from 'apps/explorer/const'
import BigNumber from 'bignumber.js'

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
        <Icon icon={faExchangeAlt} onClick={(): void => tableContext.inverPrice()} />
      </th>
      <th>
        Execution Price
        <Icon icon={faExchangeAlt} onClick={(): void => tableContext.inverPrice()} />
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
  const [rows, setRows] = React.useState(<></>)

  React.useEffect((): void => {
    // for each entry in the data array invert the values of
    // the limit price and execution price if toggled
    const _rows = data.map((order, i): JSX.Element => {
      interface price {
        amount: BigNumber
        fraction: TokenErc20
      }
      interface priceData {
        denominator: price
        numerator: price
      }

      const constructPrice = (data: priceData): string => {
        const calculatedPrice = calculatePrice({
          denominator: { amount: data.denominator.amount, decimals: data.denominator.fraction?.decimals },
          numerator: { amount: data.numerator.amount, decimals: data.numerator.fraction?.decimals },
        })

        const displayPrice = (tableContext.isPriceInverted ? invertPrice(calculatedPrice) : calculatedPrice).toString(
          10,
        )
        const formattedPrice = formatSmart({
          amount: displayPrice,
          precision: NO_ADJUSTMENT_NEEDED_PRECISION,
          smallLimit: HIGH_PRECISION_SMALL_LIMIT,
          decimals: HIGH_PRECISION_DECIMALS,
        })
        const buySymbol = order.buyToken ? safeTokenName(order.buyToken) : ''
        const sellSymbol = order.sellToken ? safeTokenName(order.sellToken) : ''
        const [baseSymbol, quoteSymbol] = tableContext.isPriceInverted
          ? [sellSymbol, buySymbol]
          : [buySymbol, sellSymbol]

        return `${formattedPrice} ${quoteSymbol} for ${baseSymbol}`
      }

      return (
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
          <td>
            {order.buyToken && order.sellToken
              ? constructPrice({
                  denominator: {
                    amount: order.buyAmount,
                    fraction: order.buyToken,
                  },
                  numerator: {
                    amount: order.sellAmount,
                    fraction: order.sellToken,
                  },
                })
              : '-'}
          </td>
          <td>
            {order.buyToken && order.sellToken
              ? constructPrice({
                  denominator: {
                    amount: order.sellAmount,
                    fraction: order.sellToken,
                  },
                  numerator: {
                    amount: order.buyAmount,
                    fraction: order.buyToken,
                  },
                })
              : '-'}
          </td>
          <td>
            <TitleUid
              textToCopy={order.txHash ?? ''}
              contentsToDisplay={
                order.txHash
                  ? `${
                      order.txHash.substr(0, 4) +
                      '...' +
                      order.txHash.substr(order.txHash.length - 3, order.txHash.length)
                    }`
                  : ''
              }
            />
          </td>
          <td>{!order.surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
          <td>
            <DateDisplay date={order.creationDate} />
          </td>
        </tr>
      )
    })
    setRows(<>{_rows}</>)
  }, [data, tableContext.isPriceInverted])

  return <SimpleTable body={rows ?? <></>} numColumns={numColumns} header={header} className={className} />
}
