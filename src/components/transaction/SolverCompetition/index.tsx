import React from 'react'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import CowLoading from 'components/common/CowLoading'
import { Network } from 'types'
import { useGetSolverCompetition } from 'hooks/useSolverCompetitionData'
import { Container, Table, ContentCard } from './styled'
import { HelpTooltip } from 'components/Tooltip'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { sendEvent } from 'components/analytics'
import { faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SolutionsTable from './SolutionsTable'
import { Order, Solution } from 'api/operator'

import { BlockExplorerLink } from 'components/common/BlockExplorerLink'
import { abbreviateString, FormatAmountPrecision, formattedAmount, getShortOrderId } from 'utils'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { TokenImgWrapper } from 'components/common/TokenImg'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'
import { TokenDisplay } from 'components/common/TokenDisplay'

interface SolverCompetitionParams {
  txHash: string
  networkId: Network | undefined
  orders: Order[] | undefined
}
const tooltip = {
  auctionID: 'A unique identifier ID for this auction.',
  startBlock: 'Start block ID for this auction',
}
interface StatusType {
  type: string
}

const StatusIcon = ({ type }: StatusType): JSX.Element => {
  const icon = type == 'executed' ? faCheckCircle : faCircleXmark
  const color = type == 'executed' ? '#00D897' : '#F1356E'
  return <FontAwesomeIcon icon={icon} color={color} />
}

export function SolverCompetition(params: SolverCompetitionParams): JSX.Element {
  const { networkId, txHash, orders } = params
  const { data, isLoading, error } = useGetSolverCompetition(txHash, networkId)
  console.log(data)
  const onCopy = (label: string): void =>
    sendEvent({
      category: 'Transaction Solve Competition screen',
      action: 'Copy',
      label,
    })
  if (isLoading) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  if (error || !data) {
    return (
      <EmptyItemWrapper>
        <p>Failed to load, please try again later</p>
      </EmptyItemWrapper>
    )
  }

  return (
    <Container>
      <Table
        body={
          <>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip} /> Auction Id
              </td>
              <td colSpan={2}>
                <RowWithCopyButton
                  textToCopy={data.auctionId?.toString()}
                  contentsToDisplay={data.auctionId?.toString()}
                  onCopy={(): void => onCopy('auctionId')}
                />
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip} /> Auction Start Block
              </td>
              <td colSpan={2}>
                <RowWithCopyButton
                  textToCopy={data.auctionStartBlock}
                  contentsToDisplay={data.auctionStartBlock}
                  onCopy={(): void => onCopy('auctionId')}
                />
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip} /> Liquidity Collected Block
              </td>
              <td colSpan={2}>
                <RowWithCopyButton
                  textToCopy={data.liquidityCollectedBlock}
                  contentsToDisplay={data.liquidityCollectedBlock}
                  onCopy={(): void => onCopy('auctionId')}
                />
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip} /> Competition Block
              </td>
              <td colSpan={2}>
                <RowWithCopyButton
                  textToCopy={data.auctionId}
                  contentsToDisplay={data.auctionId}
                  onCopy={(): void => onCopy('auctionId')}
                />
              </td>
            </tr>
            <tr className={'auction'}>
              <td>
                <HelpTooltip tooltip={tooltip} /> Auction Orders
              </td>
              <td className={'orders'}>
                <p>
                  <StatusIcon type={'executed'} /> Executed
                </p>
                <ContentCard>
                  {data.auction?.orders &&
                    data.auction?.orders.map((order) => (
                      <span key={order}>
                        <LinkWithPrefixNetwork to={`/orders/${order}`} rel="noopener noreferrer" target="_self">
                          {abbreviateString(order,6,4)}
                        </LinkWithPrefixNetwork> ,
                      </span>
                    ))}
                </ContentCard>
              </td>
              <td>
                <p>
                  <StatusIcon type={'not'} /> Not Executed
                </p>
                <ContentCard>
                  {data.auction?.orders &&
                    data.auction?.orders.map((order) => (
                      <span key={order}>
                        <LinkWithPrefixNetwork to={`/orders/${order}`} rel="noopener noreferrer" target="_self">
                          {abbreviateString(order,6,4)}
                        </LinkWithPrefixNetwork> ,
                      </span>
                    ))}
                </ContentCard>
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={tooltip} /> Clearing Price
              </td>
              <td colSpan={2}>
              </td>
            </tr>
          </>
        }
      />
      <SolutionsTable solutions={data.solutions as Solution[]} orders={orders} />
    </Container>
  )
}
