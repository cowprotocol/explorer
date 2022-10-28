import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { useNetworkId } from 'state/network'
import { Trade } from 'api/operator'
import { abbreviateString, formatSmartMaxPrecision } from 'utils'
import { useMultipleErc20 } from 'hooks/useErc20'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { LinkButton } from '../DetailsTable'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead {
    > tr > th:first-child {
      padding: 0 2rem;
    }
  }
  > tbody {
    min-height: 37rem;
    border-bottom: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
    > tr {
      min-height: 7.4rem;
      &.header-row {
        display: none;
        ${media.mobile} {
          display: flex;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          box-shadow: none;
          min-height: 2rem;
          td {
            padding: 0;
            margin: 0;
            margin-top: 1rem;
            .mobile-header {
              margin: 0;
            }
          }
        }
      }
    }
    > tr > td:first-child {
      padding: 0 2rem;
    }
  }
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 4fr 2fr 2fr 3fr 3fr 4fr 4fr;
  }
  > tbody > tr > td:nth-child(8),
  > thead > tr > th:nth-child(8) {
    justify-content: center;
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
  ${media.mobile} {
    > thead > tr {
      display: none;
      > th:first-child {
        padding: 0 1rem;
      }
    }
    > tbody > tr {
      grid-template-columns: none;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 10px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }
      td:first-child {
        padding: 0 1rem;
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
    > tbody > tr > td,
    > thead > tr > th {
      :nth-child(4),
      :nth-child(5),
      :nth-child(6),
      :nth-child(7),
      :nth-child(8) {
        justify-content: space-between;
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
        display: none;
      }
    }
  }
  overflow: auto;
`

const HeaderTitle = styled.span`
  display: none;
  ${media.mobile} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`
const HeaderValue = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.textPrimary1)};
  ${media.mobile} {
    flex-wrap: wrap;
    text-align: end;
  }
`

const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TableHeading = styled.div`
  background: ${({ theme }): string => theme.tableRowBorder};
  min-height: 11rem;
  padding: 1.6rem;
  display: flex;
  ${media.mobile} {
    flex-direction: column;
    gap: 1rem;
  }
  .tittle {
    text-transform: uppercase;
    font-size: 1.1rem;
  }
  .fillNumber {
    font-size: 3.2rem;
    margin: 1rem 0;
    color: ${({ theme }): string => theme.green};
    ${media.mobile} {
      font-size: 2.8rem;
    }
  }

  .priceNumber {
    font-size: 2.2rem;
    margin: 1rem 0;
    ${media.mobile} {
      font-size: 1.8rem;
    }
  }
`

const TableHeadingContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 20rem;
  ${media.mobile} {
    flex-direction: column;
  }
`

export type Props = StyledUserDetailsTableProps & {
  trades: Trade[] | undefined
  tableState: TableState
}

interface RowProps {
  index: number
  trade: Trade
}

const RowFill: React.FC<RowProps> = ({ trade }) => {
  const network = useNetworkId() || undefined
  const { txHash, sellAmount, buyAmount, sellTokenAddress, buyTokenAddress, executionTime } = trade
  const { value: tokens } = useMultipleErc20({
    networkId: network,
    addresses: [sellTokenAddress, buyTokenAddress],
  })
  const buyToken = tokens[buyTokenAddress]
  const sellToken = tokens[sellTokenAddress]
  const executionTimeFormatted =
    executionTime instanceof Date && !isNaN(Date.parse(executionTime.toString())) ? executionTime : new Date()

  const buyFormattedAmount =
    buyToken && buyToken.decimals >= 0
      ? formatSmartMaxPrecision(buyAmount, tokens[buyTokenAddress])
      : sellAmount.toString(10)
  const sellFormattedAmount =
    sellToken && sellToken.decimals >= 0 ? formatSmartMaxPrecision(sellAmount, sellToken) : sellAmount.toString(10)

  if (!network) {
    return null
  }

  return (
    <tr key={txHash}>
      <td>
        <HeaderTitle>Tx hash</HeaderTitle>
        <HeaderValue>
          <RowWithCopyButton
            textToCopy={txHash}
            contentsToDisplay={
              <LinkWithPrefixNetwork to={`/tx/${txHash}`} rel="noopener noreferrer" target="_self">
                {abbreviateString(txHash, 6, 4)}
              </LinkWithPrefixNetwork>
            }
          />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Surplus</HeaderTitle>
        <HeaderValue>-</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Buy amount</HeaderTitle>
        <HeaderValue>
          {buyFormattedAmount} {buyToken?.symbol}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Sell amount</HeaderTitle>
        <HeaderValue>
          {sellFormattedAmount} {sellToken?.symbol}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Execution price</HeaderTitle>
        <HeaderValue>
          {sellFormattedAmount} {sellToken?.symbol}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Execution time</HeaderTitle>
        <HeaderValue>{<DateDisplay date={executionTimeFormatted} showIcon={true} />}</HeaderValue>
      </td>
      <td>
        <HeaderTitle></HeaderTitle>
        <HeaderValue>
          <LinkButton to={`/tx/${txHash}/?tab=graph`}>
            <FontAwesomeIcon icon={faProjectDiagram} />
            View batch graph
          </LinkButton>
        </HeaderValue>
      </td>
    </tr>
  )
}

const FillsTable: React.FC<Props> = (props) => {
  const { trades, tableState, showBorderTable = false } = props
  const tradeItems = (items: Trade[] | undefined): JSX.Element => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>
              No results found. <br /> Please try another search.
            </EmptyItemWrapper>
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          {items.map((item, i) => (
            <RowFill key={item.txHash} index={i + tableState.pageOffset} trade={item} />
          ))}
        </>
      )
    }
    return tableContent
  }

  return (
    <MainWrapper>
      <TableHeading>
        {/* <FilledProgress order={order} /> */}
        <TableHeadingContent>
          <p className="tittle">Filled</p>
          <p className="fillNumber">100%</p>
        </TableHeadingContent>
        <TableHeadingContent>
          <p className="tittle">Limit Price</p>
          <p className="priceNumber">2,905 DAI per ETH</p>
        </TableHeadingContent>
      </TableHeading>
      <Wrapper
        showBorderTable={showBorderTable}
        header={
          <tr>
            <th>Tx hash</th>
            <th>Surplus</th>
            <th>Buy amount</th>
            <th>Sell amount</th>
            <th>Execution price</th>
            <th>Execution time</th>
            <th></th>
          </tr>
        }
        body={tradeItems(trades)}
      />
    </MainWrapper>
  )
}

export default FillsTable
