import { Trade } from 'api/operator'
import styled, { css } from 'styled-components'
import { RowWithCopyButton } from 'components/orders/RowWithCopyButton'
import React from 'react'
import { SimpleTable } from '../../common/SimpleTable'
import TradesTableContext from './Context/TradesTableContext'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons'
import { useTrades } from 'hooks/useOperatorTrades'
import Spinner from 'components/common/Spinner'
import { addressToErc20, ConstructedPrice, constructPrice, numberWithCommas } from 'utils'
import { BlockExplorerLink } from 'apps/explorer/components/common/BlockExplorerLink'
import { COLOURS } from 'styles'
import { Theme } from 'theme'
import { variants } from 'styled-theming'
import TokenImg from 'components/common/TokenImg'
import { HelpTooltip } from 'components/Tooltip'
import Icon from 'components/Icon'
import { SingleErc20State } from 'state/erc20'
import { useNetworkOrDefault } from 'state/network'

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
  align-items: center;
  justify-content: space-between;
  span {
    margin: 5px 0px 5px 0px;
  }
`

type TradeTypeProps = {
  buyTokenAddress: string
  sellTokenAddress: string
  isLong: boolean
}

const TradeType = ({ buyTokenAddress, sellTokenAddress, isLong }: TradeTypeProps): JSX.Element => {
  const [tokens, setTokens] = React.useState<SingleErc20State[]>([])
  const networkId = useNetworkOrDefault()

  React.useEffect(() => {
    // isLong - When True, determines if trade type is a BUY else trade type is a SELL
    addressToErc20(buyTokenAddress, networkId)
      .then((buyToken) => {
        return buyToken
      })
      .then((buyToken) => {
        addressToErc20(sellTokenAddress, networkId)
          .then((sellToken) => {
            console.log('BUY =>', buyTokenAddress, buyToken)
            setTokens(isLong ? [buyToken, sellToken] : [sellToken, buyToken])
          })
          .catch((err) => console.log('Err', err))
      })
      .catch((err) => console.log('Err', err))
  }, [isLong, buyTokenAddress, sellTokenAddress])

  return tokens.length == 2 && tokens[0] && tokens[1] ? (
    <TradeTypeWrapper>
      <span>{isLong ? 'Buy' : 'Sell'}</span>&nbsp;
      <TokenImg width={'16px'} height={'16px'} address={tokens[0].address} />
      &nbsp;
      <span>{tokens[0].symbol}</span>&nbsp;
      <span>for</span>&nbsp;
      <span>{tokens[1].symbol}</span>&nbsp;
      <TokenImg width={'16px'} height={'16px'} address={tokens[1].address} />
    </TradeTypeWrapper>
  ) : (
    <></>
  )
}

export type Props = {
  header?: JSX.Element
  className?: string
  numColumns?: number
  owner: string
  orderId?: string
}

export const TradesTable = ({ header, className, numColumns, owner, orderId }: Props): JSX.Element => {
  const tableContext = React.useContext(TradesTableContext)
  const [rows, setRows] = React.useState([{}])
  const { isLoading, trades } = useTrades({ owner, orderId })

  React.useEffect((): void => {
    populateTable()
  }, [trades, tableContext.isPriceInverted])

  const populateTable = async (): Promise<void> => {
    // for each entry in the data array invert the values of
    // the limit price and execution price if toggled
    const _rows: Array<
      Trade & {
        limitPrice: string
        executionPrice: string
      }
    > = []
    for (const trade of trades) {
      let limitPrice: ConstructedPrice | null = null,
        execPrice: ConstructedPrice | null = null
      if (trade.sellToken && trade.buyToken) {
        limitPrice = constructPrice({
          isPriceInverted: tableContext.isPriceInverted,
          order: trade,
          data: {
            numerator: {
              amount: trade.sellAmount,
              token: trade.sellToken,
            },
            denominator: {
              amount: trade.buyAmount,
              token: trade.buyToken,
            },
          },
        })
        execPrice = constructPrice({
          isPriceInverted: tableContext.isPriceInverted,
          order: trade,
          data: {
            numerator: {
              amount: trade.sellAmount,
              token: trade.sellToken,
            },
            denominator: {
              amount: trade.buyAmount,
              token: trade.buyToken,
            },
          },
        })
      }
      const result = {
        ...trade,
        limitPrice:
          trade.buyToken && trade.sellToken && limitPrice
            ? `${limitPrice.formattedAmount ?? ''} ${limitPrice.quoteSymbol} for ${limitPrice.baseSymbol}`
            : '-',
        executionPrice:
          trade.buyToken && trade.sellToken && execPrice
            ? `${execPrice.formattedAmount ?? ''} ${execPrice.quoteSymbol} for ${execPrice.baseSymbol}`
            : '-',
      }
      _rows.push(result)
    }
    setRows(_rows)
  }

  return (
    <SimpleTable
      body={
        <>
          {isLoading ? (
            <Spinner />
          ) : (
            rows.length > 0 &&
            rows.map(
              (trade: Trade & { limitPrice: string; executionPrice: string }, i) =>
                trade.orderId && (
                  <StyledTableRow key={i}>
                    <td>
                      {trade.txHash ? (
                        <RowWithCopyButton
                          textToCopy={trade.txHash}
                          onCopy={(): void => console.log('settlementTx')}
                          contentsToDisplay={
                            <BlockExplorerLink
                              identifier={trade.txHash}
                              type="tx"
                              label={`${
                                trade.txHash.substr(0, 4) +
                                '...' +
                                trade.txHash.substr(trade.txHash.length - 5, trade.txHash.length)
                              }`}
                            />
                          }
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {trade.buyTokenAddress && trade.sellTokenAddress ? (
                        <TradeType
                          buyTokenAddress={trade.buyTokenAddress}
                          sellTokenAddress={trade.sellTokenAddress}
                          isLong={i % 2 === 1}
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{/*!trade.surplusAmount.isZero() ? <OrderSurplusDisplay order={trade} /> : */ '-'}</td>
                    <td>
                      {numberWithCommas(trade.sellAmount)} {trade.sellToken?.symbol}
                    </td>
                    <td>
                      {numberWithCommas(trade.buyAmount)} {trade.buyToken?.symbol}
                    </td>
                    <td>{trade.limitPrice}</td>
                    <td>{trade.executionPrice}</td>
                  </StyledTableRow>
                ),
            )
          )}
        </>
      }
      numColumns={numColumns}
      header={header}
      className={className}
    />
  )
}
