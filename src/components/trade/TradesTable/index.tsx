import { Order } from 'api/operator'
import styled, { css } from 'styled-components'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'
import React from 'react'
import { SimpleTable } from '../../common/SimpleTable'
import TradesTableContext from './Context/TradesTableContext'
import { DateDisplay } from 'components/orders/DateDisplay'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { OrderSurplusDisplay } from 'components/orders/OrderSurplusDisplay'
import { constructPrice, numberWithCommas } from 'utils'
import { BlockExplorerLink } from 'apps/explorer/components/common/BlockExplorerLink'
import { COLOURS } from 'styles'
import { Theme } from 'theme'
import { variants } from 'styled-theming'
import TokenImg from 'components/common/TokenImg'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { HelpTooltip } from 'components/Tooltip'
import Icon from 'components/Icon'

const { white, blackLight } = COLOURS

export const TableTheme = variants('mode', 'variant', {
  default: {
    [Theme.LIGHT]: css`
      color: ${blackLight} !important;
    `,
    [Theme.DARK]: css`
      color: ${white} !important;
    `,
  },
  get primary() {
    return this.default
  },
})

const TableRow = styled.tr`
  padding: 6px 2px 6px 2px !important;
  th {
    font-weight: 600 !important;
    span {
      margin-right: 7px;
    }
  }
`
const StyledTableRow = styled(TableRow)`
  /* Fold in theme css above */
  ${TableTheme}
`

export const TradesTableHeader = (): JSX.Element => {
  const tableContext = React.useContext(TradesTableContext)

  return (
    <StyledTableRow variant={'default'}>
      <th>
        <span>Tx Id</span>
        <HelpTooltip tooltip={'Transaction Hash'} />
      </th>
      <th>Type</th>
      <th>Surplus</th>
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
      <th>Execution Time</th>
    </StyledTableRow>
  )
}

const TradeTypeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  span {
    margin: 5px 0px 5px 0px;
  }
`

type TradeTypeProps = {
  buyToken: TokenErc20
  sellToken: TokenErc20
  isLong: boolean
}

const TradeType = ({ buyToken, sellToken, isLong }: TradeTypeProps): JSX.Element => {
  const [tokens, setTokens] = React.useState<TokenErc20[]>([])
  React.useEffect(() => {
    // isLong - When True, determines if trade type is a BUY else trade type is a SELL
    setTokens(isLong ? [buyToken, sellToken] : [sellToken, buyToken])
  }, [isLong, buyToken, sellToken])

  return tokens.length > 0 ? (
    <TradeTypeWrapper>
      <span>{isLong ? 'Buy' : 'Sell'}</span>&nbsp;
      <TokenImg address={tokens[0].address} />
      &nbsp;
      <span>{tokens[0].symbol}</span>&nbsp;
      <span>for</span>&nbsp;
      <span>{tokens[1].symbol}</span>&nbsp;
      <TokenImg address={tokens[1].address} />
    </TradeTypeWrapper>
  ) : (
    <></>
  )
}

export type Props = {
  header?: JSX.Element
  className?: string
  numColumns?: number
  data: Array<Order>
}

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
                  <StyledTableRow key={i}>
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
                    <td>
                      {order.buyToken && order.sellToken ? (
                        <TradeType buyToken={order.buyToken} sellToken={order.sellToken} isLong={i % 2 === 1} />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{!order.surplusAmount.isZero() ? <OrderSurplusDisplay order={order} /> : '-'}</td>
                    <td>
                      {numberWithCommas(order.sellAmount)} {order.sellToken?.symbol}
                    </td>
                    <td>
                      {numberWithCommas(order.buyAmount)} {order.buyToken?.symbol}
                    </td>
                    <td>{order.limitPrice}</td>
                    <td>{order.executionPrice}</td>
                    <td>
                      <DateDisplay date={order.creationDate} />
                    </td>
                  </StyledTableRow>
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
