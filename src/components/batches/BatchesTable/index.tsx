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
import { CopyButton } from 'components/common/CopyButton'

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
    grid-template-columns: 24rem 16rem minmax(14rem, auto) repeat(4, minmax(10rem, 1.5fr)) 5rem;
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
    > thead > tr > th:nth-child(8),
    > tbody > tr > td:nth-child(8) {
      display: none;
    }
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
const TokenLabel = styled.span`
  display: none;
  ${media.mobile} {
    display: inline;
  }
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
  ${media.mobile} {
    :hover {
      transform: scale(1);
    }
  }
`

const MiddleEllipsis = ({ text, maxWidth }: { text: string; maxWidth: number }): React.ReactElement => {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    if (ref.current && text) {
      const element = ref.current
      const chars = text.split('')
      let truncatedText = text

      // Check if the text overflows the container
      if (element.offsetWidth > maxWidth) {
        // Loop to find the position where to place the ellipsis
        while (element.offsetWidth > maxWidth && chars.length > 0) {
          const middleIndex = Math.floor(chars.length / 2)
          chars.splice(middleIndex, 1)
          truncatedText = chars.join('')
          truncatedText = truncatedText.substring(0, middleIndex) + '...' + truncatedText.substring(middleIndex)
          element.textContent = truncatedText
        }
      }
    }
  }, [text, maxWidth])

  return <span ref={ref}>{text}</span>
}

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
        <HeaderTitle>Tx. hash</HeaderTitle>
        <HeaderValue>
          <a
            href={`/tx/${id}`}
            style={{
              marginRight: ' 0.5rem',
            }}
          >
            <MiddleEllipsis text={id} maxWidth={180} />
          </a>
          <CopyButton text={id} onCopy={(): void => console.log('copied')} />
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Date</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip textInTooltip={new Date(firstTradeTimestamp * 1000).toLocaleString()}>
            {firstTradeTimestamp ? formatDistanceToNow(new Date(firstTradeTimestamp * 1000)) + ' ago' : 'N/A'}{' '}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Solver</HeaderTitle>
        <HeaderValue>{displaySolver(solver)}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Tokens in</HeaderTitle>
        <HeaderValue>
          <TokensContainers>
            {tokens_in.map((token) => {
              const imageAddress = getImageAddress(token.address, 1)
              return (
                <TextWithTooltip key={token.address} textInTooltip={token.name + '(' + token.symbol + ')'}>
                  <TokenContainer>
                    <a
                      href={`https://etherscan.io/address/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <StyledImg address={imageAddress} />
                      <TokenLabel>{token.symbol}</TokenLabel>
                    </a>
                  </TokenContainer>
                </TextWithTooltip>
              )
            })}
          </TokensContainers>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Tokens out</HeaderTitle>
        <HeaderValue>
          <TokensContainers>
            {tokens_out.map((token) => {
              const imageAddress = getImageAddress(token.address, 1)
              return (
                <TextWithTooltip key={token.address} textInTooltip={token.name + '(' + token.symbol + ')'}>
                  <TokenContainer>
                    <a
                      href={`https://etherscan.io/address/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <StyledImg address={imageAddress} />
                      <TokenLabel>{token.symbol}</TokenLabel>
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
        <HeaderTitle>Trades count</HeaderTitle>
        <HeaderValue>{num_trades}</HeaderValue>
      </td>
      {/* Add Volume */}
      <td>
        <HeaderTitle>Batch value</HeaderTitle>
        <HeaderValue>
          {total_value !== 0
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(total_value))
            : 'Not Available'}
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
              <a
                href={
                  network === 1
                    ? `https://etherscan.io/tx/${id}`
                    : network === 100
                    ? `https://gnosisscan.io/tx/${id}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {network === 1 ? 'View on Etherscan' : network === 100 ? 'View on Gnosisscan' : 'Not Available'}
              </a>
            </MenuItem>
            <MenuItem onClick={handleClose} style={{ fontSize: '1.2rem' }}>
              <a href={`/tx/${id}`}>View on Cow Explorer</a>
            </MenuItem>
            <MenuItem onClick={handleClose} style={{ fontSize: '1.2rem' }}>
              <a href="#" onClick={(): Promise<void> => navigator.clipboard.writeText(id)}>
                Copy Tx Id
              </a>
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
              <HeaderTitle className="mobile-header">Sorted by Date</HeaderTitle>
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
          <th>Tx. hash </th>
          <th>Date&darr;</th>
          <th>Solver</th>
          <th>Tokens in</th>
          <th>Tokens out</th>
          <th>Trades count</th>
          <th>Batch value</th>
          <th></th>
        </tr>
      }
      body={batchesItems(batches)}
    />
  )
}

export default BatchesTable
