import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { formatPrice } from '@gnosis.pm/dex-js'
import { useNetworkId } from 'state/network'
import { abbreviateString } from 'utils'
import { Settlement } from 'hooks/useGetSettlements'
import { TableState } from 'hooks/useTable'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokensVisualizer } from 'components/common/TokensVisualizer'
import { numberFormatter } from 'apps/explorer/components/SummaryCardsWidget/utils'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'

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
    grid-template-columns: 10fr 6fr 7fr 7fr 7fr 9fr;
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

export type Props = StyledUserDetailsTableProps & {
  settlements: Settlement[] | undefined
  tableState: TableState
}

interface RowProps {
  index: number
  settlement: Settlement
}

const RowSettlement: React.FC<RowProps> = ({ settlement }) => {
  const { id, txHash, trades = [], tokens = [], totalVolumeUsd, firstTradeTimestamp } = settlement
  const network = useNetworkId()

  if (!network) {
    return null
  }

  return (
    <tr key={id}>
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
        <HeaderTitle>Trades</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip textInTooltip={trades.length.toLocaleString()}>
            {numberFormatter(trades.length)}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Tokens</HeaderTitle>
        <HeaderValue>
          <TokensVisualizer tokens={tokens} network={network} />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>ETH cost</HeaderTitle>
        <HeaderValue>-</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Total volume</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip
            textInTooltip={formatPrice({ price: new BigNumber(totalVolumeUsd), decimals: 2, thousands: true })}
          >
            ${Number(totalVolumeUsd) ? numberFormatter(totalVolumeUsd) : 0}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Timestamp</HeaderTitle>
        <HeaderValue>
          <DateDisplay date={new Date(firstTradeTimestamp * 1000)} showIcon={true} />
        </HeaderValue>
      </td>
    </tr>
  )
}

const SolverDetailsTable: React.FC<Props> = (props) => {
  const { settlements, tableState, showBorderTable = false } = props
  const settlementItems = (items: Settlement[] | undefined): JSX.Element => {
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
          <tr className="header-row">
            <td>
              <HeaderTitle className="mobile-header">Sorted by Timestamp: from newest to oldest</HeaderTitle>
            </td>
          </tr>
          {items.map((item, i) => (
            <RowSettlement key={`${item.id}-${i}`} index={i + tableState.pageOffset} settlement={item} />
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
          <th>Tx hash</th>
          <th>Trades</th>
          <th>Tokens</th>
          <th>ETH cost</th>
          <th>Total volume</th>
          <th>Timestamp&darr;</th>
        </tr>
      }
      body={settlementItems(settlements)}
    />
  )
}

export default SolverDetailsTable
