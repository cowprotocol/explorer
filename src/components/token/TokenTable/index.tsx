import React from 'react'
import styled from 'styled-components'

import { Token } from 'api/operator'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'

//import { useNetworkId } from 'state/network'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 12rem 7rem repeat(2, minmax(16rem, 1.5fr)) repeat(2, minmax(18rem, 2fr)) 1fr;
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
        display: none;
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

export type Props = StyledUserDetailsTableProps & {
  tokens: Token[] | undefined
}

interface RowProps {
  token: Token
}

const RowToken: React.FC<RowProps> = ({ token }) => {
  const { id, name, symbol, price, last24hours, last7Days, sevenDays, lastDayVolume } = token
  //const network = useNetworkId()

  return (
    <tr key={id}>
      <td>
        <HeaderTitle>Name</HeaderTitle>
        <HeaderValue>{name}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Symbol</HeaderTitle>
        <HeaderValue>{symbol}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price</HeaderTitle>
        <HeaderValue>{price}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>24h</HeaderTitle>
        <HeaderValue>{last24hours}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>7d</HeaderTitle>
        <HeaderValue>{sevenDays}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>24h volume</HeaderTitle>
        <HeaderValue>{lastDayVolume}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Last 7 days</HeaderTitle>
        <HeaderValue>{last7Days}</HeaderValue>
      </td>
    </tr>
  )
}

const TokenTable: React.FC<Props> = (props) => {
  const { tokens, showBorderTable = false } = props

  const tokenItems = (items: Token[] | undefined): JSX.Element => {
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
            <RowToken key={`${item.id}-${i}`} token={item} />
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
          <th>Symbol</th>
          <th>Price</th>
          <th>24h</th>
          <th>7d</th>
          <th>24h volume</th>
          <th>Last 7 days</th>
        </tr>
      }
      body={tokenItems(tokens)}
    />
  )
}

export default TokenTable
