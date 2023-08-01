import React from 'react'
import styled from 'styled-components'

import { formatDistanceToNow } from 'date-fns'

import { useNetworkId } from 'state/network'
// import Avatar from 'boring-avatars'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import { Batch } from 'hooks/useGetBatches'
import { getImageAddress } from 'utils'
import TokenImg from 'components/common/TokenImg'
import { Menu, MenuItem, IconButton } from '@material-ui/core'
// import horizontal dots
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
const Wrapper = styled(StyledUserDetailsTable)`
  > thead {
    > tr > th:first-child {
      padding: 0 2rem;
    }
  }
  > tbody {
    overflow: auto;
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
    grid-template-columns: 24rem 12rem minmax(14rem, auto) repeat(4, minmax(10rem, 1.5fr)) 5rem;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${media.mobile} {
    flex-wrap: wrap;
    text-align: end;
  }
`

export type Props = StyledUserDetailsTableProps & {
  batches: Batch[] | undefined
  tableState: TableState
}
export const StyledImg = styled(TokenImg)`
  width: 2.2rem;
  height: 2.2rem;
`

interface RowProps {
  index: number
  batch: Batch
}
const TokensContainers = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1rem;
`
const TokenContainer = styled.div`
  transition: transform 0.3s ease-in-out;
  :hover {
    transform: scale(1.4);
  }
`
const RowToken: React.FC<RowProps> = ({ batch }) => {
  const { id, firstTradeTimestamp, solver, tokens_in, tokens_out, num_trades, total_value } = batch
  // const erc20 = { name, address, symbol, decimals } as TokenErc20
  const network = useNetworkId()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  if (!network) {
    return null
  }

  function displaySolver(solver: {
    id: string
    address: string
    firstTradeTimestamp: number
    isSolver: boolean
    numberOfTrades: number
  }): React.ReactNode {
    const solverAddress = solver.address
    const prefix = solverAddress.substring(0, 8)
    const suffix = solverAddress.substring(solverAddress.length - 4)
    return (
      <div className="flex items-center">
        {/* <Avatar size={24} name={solverID} variant="pixel" colors={['#3182CE', '#2C7A7B', '#2C5282', '#2A4365']} /> */}
        <div className="ml-2">
          {prefix}...{suffix}
        </div>
      </div>
    )
  }

  return (
    <tr key={id}>
      <td>
        <HeaderTitle>ID</HeaderTitle>
        <HeaderValue>
          <a href={`/tx/${id}`}>{id}</a>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Date</HeaderTitle>
        <HeaderValue>
          {firstTradeTimestamp ? formatDistanceToNow(new Date(firstTradeTimestamp * 1000)) + ' ago' : 'N/A'}{' '}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Solver</HeaderTitle>
        <HeaderValue>{displaySolver(solver)}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Tokens In</HeaderTitle>
        <HeaderValue>
          <TokensContainers>
            {tokens_in.map((token) => {
              const imageAddress = getImageAddress(token.address, 1)
              return (
                <TextWithTooltip key={token.address} textInTooltip={token.symbol}>
                  <TokenContainer>
                    <a href={`https://etherscan.io/address/${token.address}`} target="_blank" rel="noopener noreferrer">
                      <StyledImg address={imageAddress} />
                    </a>
                  </TokenContainer>
                </TextWithTooltip>
              )
            })}
          </TokensContainers>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Tokens Out</HeaderTitle>
        <HeaderValue>
          <TokensContainers>
            {tokens_out.map((token) => {
              const imageAddress = getImageAddress(token.address, 1)
              return (
                <TextWithTooltip key={token.address} textInTooltip={token.symbol}>
                  <TokenContainer>
                    <a href={`https://etherscan.io/address/${token.address}`} target="_blank" rel="noopener noreferrer">
                      <StyledImg address={imageAddress} />
                    </a>
                  </TokenContainer>
                </TextWithTooltip>
              )
            })}
          </TokensContainers>
        </HeaderValue>
      </td>

      {/* Add Trades */}
      <td>
        <HeaderTitle>Trades Count</HeaderTitle>
        <HeaderValue>{num_trades}</HeaderValue>
      </td>
      {/* Add Volume */}
      <td>
        <HeaderTitle>Batch Value</HeaderTitle>
        <HeaderValue>
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(total_value))}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle></HeaderTitle>
        <HeaderValue>
          <IconButton
            id="basic-button"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <FontAwesomeIcon icon={faEllipsisH} color="white" size="lg" />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              style: {
                marginTop: '3rem',
                backgroundColor: '#16171F',
                color: 'white',
              },
            }}
          >
            <MenuItem onClick={handleClose} style={{ fontSize: '1.2rem' }}>
              View on Etherscan
            </MenuItem>
            <MenuItem onClick={handleClose} style={{ fontSize: '1.2rem' }}>
              View on Cow Explorer
            </MenuItem>{' '}
            <MenuItem onClick={handleClose} style={{ fontSize: '1.2rem' }}>
              Copy Tx Id
            </MenuItem>
          </Menu>
        </HeaderValue>
      </td>
    </tr>
  )
}

const BatchesTable: React.FC<Props> = (props) => {
  const { batches, tableState, showBorderTable = false } = props
  const batchesItems = (items: Batch[] | undefined): JSX.Element => {
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
              <HeaderTitle className="mobile-header">Sorted by Volume(24h): from highest to lowest</HeaderTitle>
            </td>
          </tr>
          {items.map((item, i) => (
            <RowToken key={`${item.id}-${i}`} index={i + tableState.pageOffset} batch={item} />
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
          <th>Tx. Hash </th>
          <th>Date</th>
          <th>Solver</th>
          <th>Tokens In</th>
          <th>Tokens Out</th>
          <th>Trades Count</th>
          <th>Batch Value</th>
          <th></th>
        </tr>
      }
      body={batchesItems(batches)}
    />
  )
}

export default BatchesTable
