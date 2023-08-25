import React, { useEffect, useState } from 'react'
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

import { abbreviateString } from 'utils'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import ClearingPrices from './ClearingPrices'
import { Title } from 'apps/explorer/pages/styled'
import { useTransactionData } from 'hooks/useTransactionData'
import { useWeb3 } from 'api/web3/hooks'

interface SolverCompetitionParams {
  txHash: string
  networkId: Network | undefined
  orders: Order[] | undefined
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
  const { networkId, txHash } = params
  const web3 = useWeb3()
  const [currentBlock, setCurrentBlock] = useState<number | undefined>()
  const { isLoading: isLoadingTransactionData, trace } = useTransactionData(networkId, txHash)

  useEffect(() => {
    const getCurrentBlock = async (): Promise<void> => {
      setCurrentBlock(await web3.eth.getBlockNumber())
    }
    getCurrentBlock()
  }, [web3])
  if (isLoadingTransactionData || !currentBlock) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }
  if (currentBlock && trace?.block_number && trace?.block_number + 65 >= currentBlock) {
    return (
      <EmptyItemWrapper>
        <p>Data not available yet</p>
      </EmptyItemWrapper>
    )
  }
  return <SolverCompetitionElement {...params} />
}
export function SolverCompetitionElement(params: SolverCompetitionParams): JSX.Element {
  const { networkId, txHash, orders } = params
  const { data, isLoading, error } = useGetSolverCompetition(txHash, networkId)

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
                <HelpTooltip tooltip={<div>Unique identifier for the auction.</div>} />
                Auction Id
              </td>
              <td colSpan={2}>
                {data.auctionId && (
                  <RowWithCopyButton
                    textToCopy={data.auctionId?.toString()}
                    contentsToDisplay={data.auctionId?.toString()}
                    onCopy={(): void => onCopy('auctionId')}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={<div>Block number at which the auction was initiated.</div>} />
                Auction Start Block
              </td>
              <td colSpan={2}>
                {data.auctionStartBlock && (
                  <RowWithCopyButton
                    textToCopy={data.auctionStartBlock.toString()}
                    contentsToDisplay={data.auctionStartBlock.toString()}
                    onCopy={(): void => onCopy('auctionId')}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={<div>Block number at which liquidity was collected for the auction.</div>} />
                Liquidity Collected Block
              </td>
              <td colSpan={2}>
                {data.liquidityCollectedBlock && (
                  <RowWithCopyButton
                    textToCopy={data.liquidityCollectedBlock.toString()}
                    contentsToDisplay={data.liquidityCollectedBlock.toString()}
                    onCopy={(): void => onCopy('auctionId')}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={<div>Block number marking the start of the solver competition.</div>} />
                Competition Block
              </td>
              <td colSpan={2}>
                {data?.auctionId && (
                  <RowWithCopyButton
                    textToCopy={data.auctionId.toString()}
                    contentsToDisplay={data.auctionId.toString()}
                    onCopy={(): void => onCopy('auctionId')}
                  />
                )}
              </td>
            </tr>
            <tr className={'auction'}>
              <td>
                <HelpTooltip tooltip={<div>Lists all the orders placed for the auction.</div>} />
                Auction Orders
              </td>
              <td className={'orders'}>
                <p>
                  <StatusIcon type={'executed'} /> Executed
                </p>
                <ContentCard>
                  {orders &&
                    orders.map((order, key, array) => (
                      <span key={order.uid}>
                        <LinkWithPrefixNetwork to={`/orders/${order.uid}`} rel="noopener noreferrer" target="_self">
                          {abbreviateString(order.uid, 6, 4)}
                        </LinkWithPrefixNetwork>{' '}
                        {key + 1 != array.length && <>,</>}
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
                    data.auction?.orders
                      .filter((o) => !orders?.map((order) => order.uid).includes(o))
                      .map((order, key, array) => (
                        <span key={order}>
                          <LinkWithPrefixNetwork to={`/orders/${order}`} rel="noopener noreferrer" target="_self">
                            {abbreviateString(order, 6, 4)}
                          </LinkWithPrefixNetwork>{' '}
                          {key + 1 < array.length && <>,</>}
                        </span>
                      ))}
                </ContentCard>
              </td>
            </tr>
            <tr>
              <td>
                <HelpTooltip tooltip={<div>Prices at which orders were cleared during the auction.</div>} />
                Clearing Prices
              </td>
              <td colSpan={2}>
                {data.auction?.prices && orders && <ClearingPrices orders={orders} prices={data.auction?.prices} />}
              </td>
            </tr>
            <tr>
              <Title> Solutions</Title>
              <SolutionsTable solutions={data.solutions as Solution[]} orders={orders} />
            </tr>
          </>
        }
      />
    </Container>
  )
}
