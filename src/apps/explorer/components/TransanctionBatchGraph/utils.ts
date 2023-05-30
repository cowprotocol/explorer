import Cytoscape, { ElementDefinition, EventObject } from 'cytoscape'
import React from 'react'
import { layouts } from 'apps/explorer/components/TransanctionBatchGraph/layouts'
import { Account, ALIAS_TRADER_NAME, Transfer } from 'api/tenderly'
import { TypeEdgeOnTx, TypeNodeOnTx } from 'apps/explorer/components/TransanctionBatchGraph/types'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { abbreviateString, FormatAmountPrecision, formattingAmountPrecision } from 'utils'
import { Settlement as TxSettlement } from 'hooks/useTxBatchTrades'
import { Network } from 'types'
import { networkOptions } from 'components/NetworkSelector'
import ElementsBuilder, { buildGridLayout } from 'apps/explorer/components/TransanctionBatchGraph/elementsBuilder'
import { TOKEN_SYMBOL_UNKNOWN } from 'apps/explorer/const'
import BigNumber from 'bignumber.js'
import { APP_NAME } from 'const'

const PROTOCOL_NAME = APP_NAME
const INTERNAL_NODE_NAME = `${APP_NAME} Buffer`

export interface PopperInstance {
  scheduleUpdate: () => void
  destroy: () => void
}

/**
 * This allows to bind a tooltip (popper.js) around to a cytoscape elements (node, edge)
 */
export function bindPopper(
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
  target.cy().removeListener('pan zoom tapstart')
  target.cy().on('pan zoom resize', () => popperUpdate)
  target.removeListener('click tapstart mouseout')
  const newTarget = document.getElementById(tooltipId)
  const removePopper = (): void => {
    if (newTarget) {
      newTarget.remove()
    }
    popperRef.current?.destroy()
  }
  target
    .on('click tapstart', (evt: Event) => {
      evt.stopPropagation()
      if (newTarget) {
        newTarget.classList.add('active')
      }
    })
    .on('mouseout', removePopper)
  target.cy().on('tapstart', removePopper)
}

export const updateLayout = (cy: Cytoscape.Core, layoutName: string, noAnimation = false): void => {
  cy.layout(noAnimation ? { ...layouts[layoutName], animate: false } : layouts[layoutName]).run()
  cy.fit()
}

export const removePopper = (popperInstance: React.MutableRefObject<PopperInstance | null>): void =>
  popperInstance.current?.destroy()

function getTypeNode(account: Account & { owner?: string }): TypeNodeOnTx {
  if (account.alias === ALIAS_TRADER_NAME || account.owner) {
    return TypeNodeOnTx.Trader
  } else if (account.alias === PROTOCOL_NAME) {
    return TypeNodeOnTx.CowProtocol
  }

  return TypeNodeOnTx.Dex
}

function getKindEdge(transfer: Transfer & { kind?: OrderKind }): TypeEdgeOnTx {
  if (transfer.kind === OrderKind.SELL) {
    return TypeEdgeOnTx.sellEdge
  } else if (transfer.kind === OrderKind.BUY) {
    return TypeEdgeOnTx.buyEdge
  }

  return TypeEdgeOnTx.noKind
}

function showTraderAddress(account: Account, address: string): Account {
  const alias = account.alias === ALIAS_TRADER_NAME ? abbreviateString(address, 4, 4) : account.alias

  return { ...account, alias }
}

function getNetworkParentNode(account: Account, networkName: string): string | undefined {
  return account.alias !== ALIAS_TRADER_NAME ? networkName : undefined
}

function getInternalParentNode(groupNodes: Map<string, string>, transfer: Transfer): string | undefined {
  for (const [key, value] of groupNodes) {
    if (value === transfer.from) {
      return key
    }
  }
  return undefined
}

export function getNodes(
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

  const groupNodes: Map<string, string> = new Map()

  for (const key in txSettlement.accounts) {
    const account = txSettlement.accounts[key]
    let parentNodeName = getNetworkParentNode(account, networkNode.alias)

    const receiverNode = { alias: `${abbreviateString(account.owner || key, 4, 4)}-group` }

    if (account.owner && account.owner !== key) {
      if (!groupNodes.has(receiverNode.alias)) {
        builder.node({ type: TypeNodeOnTx.NetworkNode, entity: receiverNode, id: receiverNode.alias })
        groupNodes.set(receiverNode.alias, account.owner || key)
      }
      parentNodeName = receiverNode.alias
    }

    if (getTypeNode(account) === TypeNodeOnTx.CowProtocol) {
      builder.center({ type: TypeNodeOnTx.CowProtocol, entity: account, id: key }, parentNodeName)
    } else {
      const receivers = Object.keys(txSettlement.accounts).reduce(
        (acc, key) => (txSettlement.accounts?.[key].owner ? [...acc, txSettlement.accounts?.[key].owner] : acc),
        [],
      )

      if (receivers.includes(key) && account.owner !== key) {
        if (!groupNodes.has(receiverNode.alias)) {
          builder.node({ type: TypeNodeOnTx.NetworkNode, entity: receiverNode, id: receiverNode.alias })
          groupNodes.set(receiverNode.alias, account.owner || key)
        }
        parentNodeName = receiverNode.alias
      }

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

  let internalNodeCreated = false

  txSettlement.transfers.forEach((transfer) => {
    // Custom from id when internal transfer to avoid re-using existing node
    const fromId = transfer.isInternal ? INTERNAL_NODE_NAME : transfer.from

    // If transfer is internal and a node has not been created yet, create one
    if (transfer.isInternal && !internalNodeCreated) {
      // Set flag to prevent creating more
      internalNodeCreated = true

      const account = { alias: fromId }
      builder.node(
        { type: TypeNodeOnTx.Trader, entity: account, id: fromId },
        // Put it inside the parent node
        getInternalParentNode(groupNodes, transfer),
      )
    }

    const kind = getKindEdge(transfer)
    const token = txSettlement.tokens[transfer.token]
    const tokenSymbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN
    const tokenAmount = token?.decimals
      ? formattingAmountPrecision(new BigNumber(transfer.value), token, FormatAmountPrecision.highPrecision)
      : '-'

    const source = builder.getById(fromId)
    const target = builder.getById(transfer.to)
    builder.edge(
      { type: source?.data.type, id: fromId },
      { type: target?.data.type, id: transfer.to },
      `${tokenSymbol}`,
      kind,
      {
        from: fromId,
        // Do not display `to` field on tooltip when internal transfer as it's redundant
        ...(transfer.isInternal
          ? undefined
          : {
              to: transfer.to,
            }),
        amount: `${tokenAmount} ${tokenSymbol}`,
      },
    )
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined,
  )
}
