import React, { useState } from 'react'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import { Order, Solution } from 'api/operator'
import { HelpTooltip } from 'components/Tooltip'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DetailsTable,
  SolutionsTable,
  DetailsTr,
  CalldataCard,
  HeaderTitle,
  HeaderValue,
  StyledDialog,
  CloseButton,
} from 'components/transaction/SolverCompetition/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { TokenAmount } from 'components/token/TokenAmount'
import { Collapse, DialogContent, DialogTitle, IconButton } from '@material-ui/core'
import { faChevronDown, faChevronUp, faMedal, faPlus } from '@fortawesome/free-solid-svg-icons'
import BigNumber from 'bignumber.js'
import BoringAvatar from 'components/common/Avatar'
import { formatSmart } from '@gnosis.pm/dex-js'
import TokenImg from 'components/common/TokenImg'
import { getImageAddress } from 'utils'
import { useNetworkId } from 'state/network'
import ExplorerTabs from 'apps/explorer/components/common/ExplorerTabs/ExplorerTabs'
import { NATIVE_TOKEN_PER_NETWORK, TEN_BIG_NUMBER } from 'const'
import { HIGH_PRECISION_SMALL_LIMIT, NO_ADJUSTMENT_NEEDED_PRECISION } from 'apps/explorer/const'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'

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
  handleClose?: (event: unknown, reason: 'backdropClick' | 'escapeKeyDown' | 'buttonClick') => void
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

const formatNumbers = (amount = 0): string => {
  const calculatedPrice = BigNumber(amount).div(TEN_BIG_NUMBER.exponentiatedBy(18))
  return formatSmart({
    amount: calculatedPrice.toString(),
    precision: NO_ADJUSTMENT_NEEDED_PRECISION,
    smallLimit: HIGH_PRECISION_SMALL_LIMIT,
    decimals: 6,
  })
}

const RowDetails: React.FC<DetailsProps> = ({ executedAmount, order }) => {
  const network = useNetworkId()
  if (!order || !network) {
    return <></>
  }

  const imageAddress = getImageAddress(order.sellTokenAddress, network)

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
            <TokenAmount amount={BigNumber(executedAmount)} token={order?.sellToken} />
          </span>
        )}
      </td>
    </tr>
  )
}

const DetailsGenerator: ({
  orders,
  loadedOrders,
  callData,
}: AccordionProps) => [JSX.Element, JSX.Element] | [JSX.Element, JSX.Element] = ({
  orders,
  loadedOrders,
  callData,
}: AccordionProps) => {
  if (!orders || orders.length === 0) {
    return [
      <tr key={0} className="row-empty">
        <td className="row-td-empty">
          <EmptyItemWrapper>
            Can&apos;t load details <br /> Please try again
          </EmptyItemWrapper>
        </td>
      </tr>,
      <tr key={1} className="row-empty">
        <td className="row-td-empty">
          <EmptyItemWrapper>
            Can&apos;t load details <br /> Please try again
          </EmptyItemWrapper>
        </td>
      </tr>,
    ]
  }
  const mapOrders = orders.map((order) => ({ ...order, order: loadedOrders?.find((o) => o.uid == order.id) }))

  return [
    <DetailsTable
      key={0}
      header={
        <tr>
          <th>Order id</th>
          <th>Executed Amount</th>
        </tr>
      }
      body={<> {mapOrders.map((order) => RowDetails({ executedAmount: order.executedAmount, order: order.order }))}</>}
    />,
    <RowWithCopyButton
      key={1}
      textToCopy={callData || ''}
      className={'calldataBox'}
      contentsToDisplay={
        <>
          <div className={'title'}>
            Calldata <HelpTooltip tooltip={tooltip.name} />
          </div>
          <CalldataCard>
            <span>{callData}</span>
          </CalldataCard>
        </>
      }
    />,
  ]
}

const ModalContent: React.FC<AccordionProps> = ({ orders, loadedOrders, callData, open, handleClose }) => {
  let closeModal = (): void => console.warn('close not implemented')
  if (handleClose) {
    closeModal = (): void => handleClose({}, 'buttonClick')
  }

  if (!orders || orders.length === 0) {
    return (
      <StyledDialog onClose={handleClose} className={'modal-mobile'} open={!!open}>
        <DialogTitle id="customized-dialog-title">
          Error <CloseButton onClick={closeModal}>X</CloseButton>
        </DialogTitle>
        <EmptyItemWrapper>
          Can&apos;t load details <br /> Please try again
        </EmptyItemWrapper>
      </StyledDialog>
    )
  }
  const elements = DetailsGenerator({ orders, loadedOrders, callData })
  return (
    <StyledDialog scroll={'body'} onClose={handleClose} className={'modal-mobile'} open={!!open}>
      <DialogTitle id="customized-dialog-title">
        Details
        <CloseButton onClick={closeModal}>X</CloseButton>
      </DialogTitle>
      <DialogContent dividers>
        <ExplorerTabs
          tabItems={[
            {
              id: 1,
              tab: <>Orders</>,
              content: elements[0],
            },
            {
              id: 2,
              tab: <>Calldata</>,
              content: elements[1],
            },
          ]}
        />
      </DialogContent>
    </StyledDialog>
  )
}
const AccordionContent: React.FC<AccordionProps> = ({ orders, loadedOrders, callData, open }) => {
  if (!orders || orders.length === 0) {
    return (
      <tr className="row-empty small-hidden">
        <td className="row-td-empty">
          <EmptyItemWrapper>
            Can&apos;t load details <br /> Please try again
          </EmptyItemWrapper>
        </td>
      </tr>
    )
  }
  const elements = DetailsGenerator({ orders, loadedOrders, callData })
  return (
    <DetailsTr className={'small-hidden'}>
      <Collapse in={open}>
        <td>{elements[0]}</td>
        <td>{elements[1]}</td>
      </Collapse>
    </DetailsTr>
  )
}

const RowSolution: React.FC<RowProps> = ({ solution, orders }) => {
  const { ranking, solver, solverAddress } = solution ?? {}
  const [open, setOpen] = useState<boolean>(false)
  const isMobile = useMediaBreakpoint(['xs', 'sm'])
  const network = useNetworkId() || 1
  const { total, surplus, fees, cost, gas } = solution?.objective || {}
  return (
    <>
      <tr className={'ranking'} key={ranking}>
        <td>
          <HeaderTitle>
            Ranking <HelpTooltip tooltip={tooltip.surplus} />
          </HeaderTitle>
          <HeaderValue>{ranking}</HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            Name <HelpTooltip tooltip={tooltip.name} />
          </HeaderTitle>
          <HeaderValue>
            <BoringAvatar alt={solver} />
            <LinkWithPrefixNetwork to={`/user/${solverAddress}`}>
              {solver} {ranking == 1 && <FontAwesomeIcon icon={faMedal} style={{ color: '#f4b731' }} />}
            </LinkWithPrefixNetwork>
          </HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            Total <HelpTooltip tooltip={tooltip.total} />
          </HeaderTitle>
          <HeaderValue>
            {formatNumbers(total)} {NATIVE_TOKEN_PER_NETWORK[network].symbol}
          </HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            Surplus <HelpTooltip tooltip={tooltip.surplus} />
          </HeaderTitle>
          <HeaderValue>
            {formatNumbers(surplus)} {NATIVE_TOKEN_PER_NETWORK[network].symbol}
          </HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            Fees <HelpTooltip tooltip={tooltip.surplus} />
          </HeaderTitle>
          <HeaderValue>
            {formatNumbers(fees)} {NATIVE_TOKEN_PER_NETWORK[network].symbol}
          </HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            Fees <HelpTooltip tooltip={tooltip.surplus} />
          </HeaderTitle>
          <HeaderValue>
            {formatNumbers(cost)} {NATIVE_TOKEN_PER_NETWORK[network].symbol}
          </HeaderValue>
        </td>
        <td>
          <HeaderTitle>
            gas <HelpTooltip tooltip={tooltip.surplus} />
          </HeaderTitle>
          <HeaderValue>{formatNumbers(gas)} WEI</HeaderValue>
        </td>
        <td>
          <IconButton className={'mediumUp'} aria-label="expand row" size="small" onClick={(): void => setOpen(!open)}>
            {open ? (
              <FontAwesomeIcon color={'#ffffff'} icon={faChevronUp} />
            ) : (
              <FontAwesomeIcon color={'#ffffff'} icon={faChevronDown} />
            )}
          </IconButton>
          <IconButton className={'mobile'} aria-label="expand row" size="small" onClick={(): void => setOpen(!open)}>
            <FontAwesomeIcon color={'#ffffff'} icon={faPlus} />
          </IconButton>
        </td>
      </tr>
      {solution.orders &&
        AccordionContent({ orders: solution.orders, loadedOrders: orders, callData: solution.callData, open })}
      {solution.orders &&
        isMobile &&
        ModalContent({
          orders: solution.orders,
          loadedOrders: orders,
          callData: solution.callData,
          open,
          handleClose: () => setOpen(false),
        })}
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
          <th>Name </th>
          <th>Total</th>
          <th>Surplus</th>
          <th>Fees</th>
          <th>Cost</th>
          <th>Gas</th>
          <th></th>
        </tr>
      }
      body={SolutionsItens(solutions)}
    />
  )
}

export default Solutions
