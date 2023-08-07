import React, { useState } from 'react'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { Order, Solution } from 'api/operator'
import { HelpTooltip } from 'components/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DetailsTable, SolutionsTable, DetailsTr } from 'components/transaction/SolverCompetition/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { TokenAmount } from 'components/token/TokenAmount'
import { Collapse, IconButton } from '@material-ui/core'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

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
  callData: string | undefined
  open?: boolean
}
type RowProps = {
  solution: Solution
  orders: Order[] | undefined
}
const RowDetails: React.FC<DetailsProps> = ({ executedAmount, order }) => {
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
      <td>
        <TokenAmount amount={executedAmount} token={order?.buyToken} />
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
  console.log(mapOrders)
  return (
    <DetailsTr>
      <td>
        <Collapse in={open}>
          <DetailsTable
            header={
              <tr>
                <th>Order id</th>
                <th>Executed Amount</th>
              </tr>
            }
            body={mapOrders.map((order) => RowDetails({ executedAmount: order.executedAmount, order: order.order }))}
          />
        </Collapse>
      </td>
      <td>
        <textarea>{callData}</textarea>
      </td>
    </DetailsTr>
  )
}
const RowSolution: React.FC<RowProps> = ({ solution, orders }) => {
  const { ranking, solver } = solution ?? {}
  const [open, setOpen] = useState<boolean>(false)
  const { total, surplus, fees, cost, gas } = solution?.objective || {}
  return (
    <>
      <tr>
        <td>{ranking}</td>
        <td>{solver}</td>
        <td>{total}</td>
        <td>{surplus}</td>
        <td>{fees}</td>
        <td>{cost}</td>
        <td>{gas}</td>
        <td>
          <IconButton aria-label="expand row" size="small" onClick={(): void => setOpen(!open)}>
            {open ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
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
            Name <HelpTooltip tooltip={} />
          </th>
          <th>
            Total
            <HelpTooltip tooltip={} />
          </th>
          <th>
            Surplus
            <HelpTooltip tooltip={} />
          </th>
          <th>
            Fees
            <HelpTooltip tooltip={} />
          </th>
          <th>
            Cost
            <HelpTooltip tooltip={} />
          </th>
          <th>
            Gas
            <HelpTooltip tooltip={} />
          </th>
          <th></th>
        </tr>
      }
      body={SolutionsItens(solutions)}
    />
  )
}

export default Solutions
