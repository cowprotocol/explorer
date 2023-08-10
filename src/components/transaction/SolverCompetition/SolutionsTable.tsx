import React, { useState } from 'react'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { Order, Solution } from 'api/operator'
import { HelpTooltip } from 'components/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DetailsTable, SolutionsTable, DetailsTr, CalldataCard } from 'components/transaction/SolverCompetition/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { TokenAmount } from 'components/token/TokenAmount'
import { Collapse, IconButton } from '@material-ui/core'
import { faChevronDown, faChevronUp, faMedal } from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import BoringAvatar from 'components/common/Avatar'
import { formatSmart } from '@gnosis.pm/dex-js'
import TokenImg from 'components/common/TokenImg'
import { getImageAddress } from 'utils'
import { useNetworkId } from 'state/network'

export type Props = {
  solutions: Solution[] | undefined
  orders: Order[] | undefined
}
type DetailsProps = {
  executedAmount: string | undefined
  order: Order | undefined
}
type AccordionProps = {
  orders: Solution['orders']
  loadedOrders: Order[] | undefined
  callData?: string
  open?: boolean
}
type RowProps = {
  solution: Solution
  orders: Order[] | undefined
}

const tooltip = {
  gas: '',
  fees: '',
  cost: '',
  surplus: '',
  total: '',
  name: '',
}

const RowDetails: React.FC<DetailsProps> = ({ executedAmount, order }) => {
  const network = useNetworkId()
  if (!order || !network) {
    return <></>
  }

  const imageAddress = getImageAddress(order.buyTokenAddress, network)

  return (
    <tr>
      <td>
        <RowWithCopyButton
          className="span-copybtn-wrap"
          textToCopy={order?.uid}
          contentsToDisplay={
            <LinkWithPrefixNetwork to={`/orders/${order?.uid}`} rel="noopener noreferrer" target="_self">
              {order?.shortId}
            </LinkWithPrefixNetwork>
          }
        />
      </td>
      <td className={'amount'}>
        {executedAmount && (
          <span>
            <TokenImg address={imageAddress} />
            <TokenAmount amount={BigNumber(executedAmount)} token={order?.buyToken} />
          </span>
        )}
      </td>
    </tr>
  )
}
const AccordionContent: React.FC<AccordionProps> = ({ orders, loadedOrders, callData, open }) => {
  if (!orders || orders.length === 0) {
    return (
      <tr className="row-empty">
        <td className="row-td-empty">
          <EmptyItemWrapper>
            Can&apos;t load details <br /> Please try again
          </EmptyItemWrapper>
        </td>
      </tr>
    )
  }
  const mapOrders = orders.map((order) => ({ ...order, order: loadedOrders?.find((o) => o.uid == order.id) }))
  return (
    <DetailsTr>
      <Collapse in={open}>
        <td>
          <DetailsTable
            header={
              <tr>
                <th>Order id</th>
                <th>Executed Amount</th>
              </tr>
            }
            body={
              <> {mapOrders.map((order) => RowDetails({ executedAmount: order.executedAmount, order: order.order }))}</>
            }
          />
        </td>
        <td>
          {callData && (
            <RowWithCopyButton
              textToCopy={callData}
              className={'calldataBox'}
              contentsToDisplay={
                <>
                  <div>
                    Calldata <HelpTooltip tooltip={tooltip.name} />
                  </div>
                  <CalldataCard>
                    <span>{callData}</span>
                  </CalldataCard>
                </>
              }
            />
          )}
        </td>
      </Collapse>
    </DetailsTr>
  )
}
const RowSolution: React.FC<RowProps> = ({ solution, orders }) => {
  const { ranking, solver, solverAddress } = solution ?? {}
  const [open, setOpen] = useState<boolean>(false)

  const { total, surplus, fees, cost, gas } = solution?.objective || {}
  return (
    <>
      <tr className={'ranking'} key={ranking}>
        <td>{ranking}</td>
        <td>
          <BoringAvatar alt={solver} />
          <LinkWithPrefixNetwork to={`/user/${solverAddress}`}>
            {solver} {ranking == 1 && <FontAwesomeIcon icon={faMedal} style={{ color: '#f4b731' }} />}
          </LinkWithPrefixNetwork>
        </td>
        <td>{total} ETH</td>
        <td>{surplus} ETH</td>
        <td>{fees} ETH</td>
        <td>{cost} ETH</td>
        <td>{gas && formatSmart(gas?.toString(), 4)}</td>
        <td>
          <IconButton aria-label="expand row" size="small" onClick={(): void => setOpen(!open)}>
            {open ? (
              <FontAwesomeIcon color={'#ffffff'} icon={faChevronUp} />
            ) : (
              <FontAwesomeIcon color={'#ffffff'} icon={faChevronDown} />
            )}
          </IconButton>
        </td>
      </tr>
      {solution.orders &&
        AccordionContent({ orders: solution.orders, loadedOrders: orders, callData: solution.callData, open })}
    </>
  )
}

const Solutions: React.FC<Props> = (props) => {
  const { solutions, orders } = props

  const SolutionsItens = (items: Solution[] | undefined): JSX.Element => {
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
          {items
            .sort((a, b) => a.ranking - b.ranking)
            .map((item) => (
              <RowSolution key={`${item.ranking}`} solution={item} orders={orders} />
            ))}
        </>
      )
    }
    return tableContent
  }

  return (
    <SolutionsTable
      header={
        <tr>
          <th>#</th>
          <th>
            Name <HelpTooltip tooltip={tooltip.name} />
          </th>
          <th>
            Total
            <HelpTooltip tooltip={tooltip.total} />
          </th>
          <th>
            Surplus
            <HelpTooltip tooltip={tooltip.surplus} />
          </th>
          <th>
            Fees
            <HelpTooltip tooltip={tooltip.fees} />
          </th>
          <th>
            Cost
            <HelpTooltip tooltip={tooltip.cost} />
          </th>
          <th>
            Gas
            <HelpTooltip tooltip={tooltip.gas} />
          </th>
          <th></th>
        </tr>
      }
      body={SolutionsItens(solutions)}
    />
  )
}

export default Solutions
