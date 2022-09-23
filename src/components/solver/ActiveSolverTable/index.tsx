import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { formatPrice } from '@gnosis.pm/dex-js'
import { useNetworkId } from 'state/network'
import { abbreviateString } from 'utils'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import Identicon from 'components/common/Identicon'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import { Solver } from 'hooks/useGetSolvers'

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
    grid-template-columns: 25rem 12rem minmax(7rem, 17rem) repeat(2, minmax(10rem, 1.5fr));
  }
  > tbody > tr > td,
  > thead > tr > th {
    :nth-child(4),
    :nth-child(5),
    :nth-child(6),
    :nth-child(7) {
      justify-content: center;
      text-align: center;
    }
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
const IdenticonWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 1rem;
`

export type Props = StyledUserDetailsTableProps & {
  solvers: Solver[] | undefined
  tableState: TableState
}

interface RowProps {
  index: number
  solver: Solver
}

const RowSolver: React.FC<RowProps> = ({ solver }) => {
  const { id, name, address, numberOfTrades, numberOfSettlements, solvedAmountUsd } = solver
  const network = useNetworkId()

  if (!network) {
    return null
  }

  return (
    <tr key={id}>
      <td>
        <HeaderTitle>Name</HeaderTitle>
        <HeaderValue>
          <IdenticonWrapper>
            <Identicon address={address} size="md" />
            <BlockExplorerLink type="address" networkId={network} identifier={address} label={name} />
          </IdenticonWrapper>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Trades</HeaderTitle>
        <HeaderValue>{numberOfTrades}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Total Volume</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip textInTooltip={`$${Number(solvedAmountUsd) || 0}`}>
            {Number(solvedAmountUsd)
              ? formatPrice({ price: new BigNumber(solvedAmountUsd), decimals: 2, thousands: true })
              : 0}
            &nbsp; USD
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Total Settlements</HeaderTitle>
        <HeaderValue>{numberOfSettlements}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Solver Address</HeaderTitle>
        <HeaderValue>
          <BlockExplorerLink
            type="address"
            networkId={network}
            identifier={address}
            label={abbreviateString(address, 6, 4)}
          />
        </HeaderValue>
      </td>
    </tr>
  )
}

const SolverTable: React.FC<Props> = (props) => {
  const { solvers, tableState, showBorderTable = false } = props
  const solverItems = (items: Solver[] | undefined): JSX.Element => {
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
            <RowSolver key={`${item.id}-${i}`} index={i + tableState.pageOffset} solver={item} />
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
          <th>Name</th>
          <th>Trades</th>
          <th>Total Volume</th>
          <th>Total Settlements</th>
          <th>Solver Address</th>
        </tr>
      }
      body={solverItems(solvers)}
    />
  )
}

export default SolverTable
