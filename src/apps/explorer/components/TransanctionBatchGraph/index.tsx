import Cytoscape, { ElementDefinition, NodeDataDefinition, EdgeDataDefinition, EventObject } from 'cytoscape'
import popper from 'cytoscape-popper'
import noOverlap from 'cytoscape-no-overlap'
import fcose from 'cytoscape-fcose'
import cola from 'cytoscape-cola'
import dagre from 'cytoscape-dagre'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import styled, { useTheme } from 'styled-components'
import BigNumber from 'bignumber.js'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { faRedo, faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { GetTxBatchTradesResult as TxBatchData, Settlement as TxSettlement } from 'hooks/useTxBatchTrades'
import { networkOptions } from 'components/NetworkSelector'
import { Network } from 'types'
import { Account, ALIAS_TRADER_NAME, Transfer } from 'api/tenderly'
import ElementsBuilder, { buildGridLayout } from 'apps/explorer/components/TransanctionBatchGraph/elementsBuilder'
import { TypeEdgeOnTx, TypeNodeOnTx } from './types'
import { APP_NAME } from 'const'
import { HEIGHT_HEADER_FOOTER, TOKEN_SYMBOL_UNKNOWN } from 'apps/explorer/const'
import { STYLESHEET, ResetButton, LayoutButton } from './styled'
import { abbreviateString, FormatAmountPrecision, formattingAmountPrecision } from 'utils'
import CowLoading from 'components/common/CowLoading'
import { media } from 'theme/styles/media'
import { EmptyItemWrapper } from 'components/common/StyledUserDetailsTable'
import useWindowSizes from 'hooks/useWindowSizes'
import { layouts, layoutsNames } from './layouts'
import { Dropdown, DropdownOption } from 'apps/explorer/components/common/Dropdown'

Cytoscape.use(popper)
Cytoscape.use(noOverlap)
Cytoscape.use(fcose)
Cytoscape.use(cola)
Cytoscape.use(dagre)

const PROTOCOL_NAME = APP_NAME
const WrapperCytoscape = styled(CytoscapeComponent)`
  background-color: ${({ theme }): string => theme.bg1};
  font-weight: ${({ theme }): string => theme.fontMedium};
  border-radius: 0.6rem;
  ${media.mediumDown} {
    border: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
    margin: 1.6rem 0;
  }
`

function getTypeNode(account: Account): TypeNodeOnTx {
  let type = TypeNodeOnTx.Dex
  if (account.alias === ALIAS_TRADER_NAME) {
    type = TypeNodeOnTx.Trader
  } else if (account.alias === PROTOCOL_NAME) {
    type = TypeNodeOnTx.CowProtocol
  }

  return type
}

function getKindEdge(transfer: Transfer & { kind?: OrderKind }): TypeEdgeOnTx {
  let kind = TypeEdgeOnTx.noKind
  if (transfer.kind === OrderKind.SELL) {
    kind = TypeEdgeOnTx.sellEdge
  } else if (transfer.kind === OrderKind.BUY) {
    kind = TypeEdgeOnTx.buyEdge
  }

  return kind
}

function showTraderAddress(account: Account, address: string): Account {
  const alias = account.alias === ALIAS_TRADER_NAME ? abbreviateString(address, 4, 4) : account.alias

  return { ...account, alias }
}

function getNetworkParentNode(account: Account, networkName: string): string | undefined {
  return account.alias !== ALIAS_TRADER_NAME ? networkName : undefined
}

function getNodes(
  txSettlement: TxSettlement,
  networkId: Network,
  heightSize: number,
  layout: string,
): ElementDefinition[] {
  if (!txSettlement.accounts) return []

  const networkName = networkOptions.find((network) => network.id === networkId)?.name
  const networkNode = { alias: `${networkName} Liquidity` || '' }
  const builder = new ElementsBuilder(heightSize)
  builder.node({ type: TypeNodeOnTx.NetworkNode, entity: networkNode, id: networkNode.alias })

  for (const key in txSettlement.accounts) {
    const account = txSettlement.accounts[key]
    const parentNodeName = getNetworkParentNode(account, networkNode.alias)

    if (getTypeNode(account) === TypeNodeOnTx.CowProtocol) {
      builder.center({ type: TypeNodeOnTx.CowProtocol, entity: account, id: key }, parentNodeName)
    } else {
      builder.node(
        {
          id: key,
          type: getTypeNode(account),
          entity: showTraderAddress(account, key),
        },
        parentNodeName,
      )
    }
  }

  txSettlement.transfers.forEach((transfer) => {
    const kind = getKindEdge(transfer)
    const token = txSettlement.tokens[transfer.token]
    const tokenSymbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
    const tokenAmount = token?.decimals
      ? formattingAmountPrecision(new BigNumber(transfer.value), token, FormatAmountPrecision.highPrecision)
      : '-'

    const source = builder.getById(transfer.from)
    const target = builder.getById(transfer.to)
    builder.edge(
      { type: source?.data.type, id: transfer.from },
      { type: target?.data.type, id: transfer.to },
      `${tokenSymbol}`,
      kind,
      { from: transfer.from, to: transfer.to, amount: `${tokenAmount} ${tokenSymbol}` },
    )
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined,
  )
}

interface PopperInstance {
  scheduleUpdate: () => void
  destroy: () => void
}

/**
 * This allow bind a tooltip (popper.js) around to a cytoscape elements (node, edge)
 */
function bindPopper(
  event: EventObject,
  targetData: Cytoscape.NodeDataDefinition | Cytoscape.EdgeDataDefinition,
  popperRef: React.MutableRefObject<PopperInstance | null>,
): void {
  const tooltipId = `popper-target-${targetData.id}`
  const popperClassTarget = 'target-popper'

  // Remove if already existing
  const existingTooltips: HTMLCollectionOf<Element> = document.getElementsByClassName(popperClassTarget)
  Array.from(existingTooltips).forEach((ele: { remove: () => void }): void => ele && ele.remove())

  const target = event.target
  popperRef.current = target.popper({
    content: () => {
      const tooltip = document.createElement('span')
      tooltip.id = tooltipId
      tooltip.classList.add(popperClassTarget)

      const table = document.createElement('table')
      tooltip.append(table)

      // loop through target data [tooltip]
      for (const prop in targetData.tooltip) {
        const targetValue = targetData.tooltip[prop]

        // no recursive or reduce support
        if (typeof targetValue === 'object') continue

        const tr = table.insertRow()

        const tdTitle = tr.insertCell()
        const tdValue = tr.insertCell()

        tdTitle.innerText = prop
        tdValue.innerText = targetValue
      }

      document.body.appendChild(tooltip)

      return tooltip
    },
    popper: {
      placement: 'top-start',
      removeOnDestroy: true,
    },
  }) as PopperInstance

  const popperUpdate = (): void => popperRef.current?.scheduleUpdate()

  target.on('position', () => popperUpdate)
  target.cy().removeListener('pan zoom')
  target.cy().on('pan zoom resize', () => popperUpdate)
  const newTarget = document.getElementById(tooltipId)
  target
    .on('click tapstart', () => {
      if (newTarget) {
        newTarget.classList.add('active')
      }
    })
    .on('mouseout tapend', () => {
      if (newTarget) {
        newTarget.remove()
      }
      popperRef.current?.destroy()
    })
}

interface GraphBatchTxParams {
  txBatchData: TxBatchData
  networkId: Network | undefined
}

const iconDice = [faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive]

const updateLayout = (cy: Cytoscape.Core, layoutName: string): void => {
  cy.layout(layouts[layoutName]).run()
  cy.fit()
}

function TransanctionBatchGraph({
  txBatchData: { error, isLoading, txSettlement },
  networkId,
}: GraphBatchTxParams): JSX.Element {
  const [elements, setElements] = useState<ElementDefinition[]>([])
  const cytoscapeRef = useRef<Cytoscape.Core | null>(null)
  const cyPopperRef = useRef<PopperInstance | null>(null)
  const [resetZoom, setResetZoom] = useState<boolean | null>(null)
  const [layout, setLayout] = useState(layouts.grid)
  const theme = useTheme()
  const { innerHeight } = useWindowSizes()
  const heightSize = innerHeight && innerHeight - HEIGHT_HEADER_FOOTER
  const currenLayoutIndex = layoutsNames.findIndex((nameLayout) => nameLayout === layout.name)

  const setCytoscape = useCallback(
    (ref: Cytoscape.Core) => {
      cytoscapeRef.current = ref
      ref.removeListener('resize')
      ref.on('resize', () => {
        updateLayout(ref, layout.name)
      })
    },
    [layout],
  )

  useEffect(() => {
    const cy = cytoscapeRef.current
    setElements([])
    if (error || isLoading || !networkId || !heightSize || !cy) return

    setElements(getNodes(txSettlement, networkId, heightSize, layout.name))
    if (resetZoom) {
      updateLayout(cy, layout.name)
    }
    setResetZoom(null)
  }, [error, isLoading, txSettlement, networkId, heightSize, resetZoom, layout.name])

  useEffect(() => {
    const cy = cytoscapeRef.current
    if (!cy || !elements.length) return

    cy.on('mouseover touchstart', 'edge', (event): void => {
      const target = event.target
      const targetData: NodeDataDefinition | EdgeDataDefinition = target.data()

      bindPopper(event, targetData, cyPopperRef)
    })
    cy.on('mouseover', 'edge', (event): void => {
      event.target.addClass('hover')
    })
    cy.on('mouseout', 'edge', (event): void => {
      event.target.removeClass('hover')
    })
    cy.nodes().noOverlap({ padding: 5 })

    return (): void => cy.removeAllListeners()
  }, [cytoscapeRef, elements.length])

  if (isLoading)
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )

  return (
    <>
      <WrapperCytoscape
        elements={elements}
        layout={layout}
        style={{ width: '100%', height: heightSize }}
        stylesheet={STYLESHEET(theme)}
        cy={setCytoscape}
        wheelSensitivity={0.2}
        className="tx-graph"
        maxZoom={3}
        minZoom={0.1}
        zoom={1}
      />
      <ResetButton type="button" onClick={(): void => setResetZoom(!resetZoom)}>
        <FontAwesomeIcon icon={faRedo} /> <span>Reset</span>
      </ResetButton>
      <LayoutButton>
        <FontAwesomeIcon icon={iconDice[currenLayoutIndex]} />
        <Dropdown
          currentItem={currenLayoutIndex}
          dropdownButtonContent={
            <>
              <span>Layout: {layout.name}</span>
              <span>▼</span>
            </>
          }
          dropdownButtonContentOpened={
            <>
              <span>Layout: {layout.name}</span>
              <span>▲</span>
            </>
          }
          items={layoutsNames.map((layoutName) => (
            <DropdownOption key={layoutName} onClick={(): void => setLayout(layouts[layoutName])}>
              {layoutName}
            </DropdownOption>
          ))}
        />
      </LayoutButton>
    </>
  )
}

export default TransanctionBatchGraph
