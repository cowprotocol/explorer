import { Trade, Transfer } from 'api/tenderly'
import { Settlement as TxSettlement } from 'hooks/useTxBatchTrades'
import { Network } from 'types'
import { ElementDefinition } from 'cytoscape'
import { networkOptions } from 'components/NetworkSelector'
import ElementsBuilder, { buildGridLayout } from 'apps/explorer/components/TransanctionBatchGraph/elementsBuilder'
import { TypeEdgeOnTx, TypeNodeOnTx } from 'apps/explorer/components/TransanctionBatchGraph/types'
import { getExplorerUrl } from 'utils/getExplorerUrl'
import { abbreviateString } from 'utils'

const ADDRESSES_TO_IGNORE = new Set()
// CoW Protocol settlement contract
ADDRESSES_TO_IGNORE.add('0x9008d19f58aabd9ed0d60971565aa8510560ab41')
// ETH Flow contract
ADDRESSES_TO_IGNORE.add('0x40a50cf069e992aa4536211b23f286ef88752187')

export type ContractTrade = {
  address: string
  sellTransfers: Transfer[]
  buyTransfers: Transfer[]
}

export function getContractTrades(trades: Trade[], transfers: Transfer[]): ContractTrade[] {
  const userAddresses = new Set<string>()
  const contractAddresses = new Set<string>()

  // Build a list of addresses that are involved in trades
  // Note: at this point we don't have the receivers - if different from owner
  trades.forEach((trade) => userAddresses.add(trade.owner))

  // Build list of contract addresses based on trades, which are not traders
  // nor part of the ignored set (CoW Protocol itself, special contracts etc)
  transfers.forEach((transfer) => {
    ;[transfer.from, transfer.to].forEach((address) => {
      if (!userAddresses.has(address) && !ADDRESSES_TO_IGNORE.has(address)) {
        contractAddresses.add(address)
      }
    })
  })

  // Get contract trades
  return Array.from(contractAddresses).map((address) => {
    const sellTransfers: Transfer[] = []
    const buyTransfers: Transfer[] = []

    transfers.forEach((transfer) => {
      if (transfer.from === address) {
        sellTransfers.push(transfer)
      } else if (transfer.to === address) {
        buyTransfers.push(transfer)
      }
    })

    return { address, sellTransfers, buyTransfers }
  })
}

// TODO: these types might overlap with existing ones, consider reusing them
export type Node = {
  address: string
  isHyperNode?: boolean
}

export type Edge = {
  from: string
  to: string
  address: string
  trade?: Trade
  fromTransfer?: Transfer
  toTransfer?: Transfer
  hyperNode?: 'from' | 'to'
}

export type NodesAndEdges = {
  nodes: Node[]
  edges: Edge[]
}

export function getNotesAndEdges(userTrades: Trade[], contractTrades: ContractTrade[]): NodesAndEdges {
  const nodes: Record<string, Node> = {}
  const edges: Edge[] = []

  userTrades.forEach((trade) => {
    nodes[trade.sellToken] = { address: trade.sellToken }
    nodes[trade.buyToken] = { address: trade.buyToken }

    // one edge for each user trade
    edges.push({ from: trade.sellToken, to: trade.buyToken, address: trade.owner, trade })
  })

  contractTrades.forEach((trade) => {
    // add all sellTokens from contract trades to nodes
    trade.sellTransfers.forEach(({ token }) => (nodes[token] = { address: token }))
    // add all buyTokens from contract trades to nodes
    trade.buyTransfers.forEach(({ token }) => (nodes[token] = { address: token }))

    if (trade.sellTransfers.length === 1 && trade.buyTransfers.length === 1) {
      // no need to add a new node
      // normal edge for normal contract interaction
      const sellTransfer = trade.sellTransfers[0]
      const buyTransfer = trade.buyTransfers[0]
      edges.push({
        from: sellTransfer.token,
        to: buyTransfer.token,
        address: trade.address,
        fromTransfer: sellTransfer,
        toTransfer: buyTransfer,
      })
    } else if (trade.sellTransfers.length > 1 || trade.buyTransfers.length > 1) {
      // if  there are more than one sellToken or buyToken, the contract becomes a node
      nodes[trade.address] = { address: trade.address, isHyperNode: true }

      // one edge for each sellToken
      trade.sellTransfers.forEach((transfer) =>
        edges.push({ from: transfer.token, to: trade.address, address: trade.address, hyperNode: 'to' }),
      )
      // one edge for each buyToken
      trade.buyTransfers.forEach((transfer) =>
        edges.push({ from: trade.address, to: transfer.token, address: trade.address, hyperNode: 'from' }),
      )
    }
  })

  return {
    nodes: Object.values(nodes),
    edges,
  }
}

export function getNodesAlternative(
  txSettlement: TxSettlement,
  networkId: Network,
  heightSize: number,
  layout: string,
): ElementDefinition[] {
  const networkName = networkOptions.find((network) => network.id === networkId)?.name
  const networkNode = { alias: `${networkName} Liquidity` || '' }
  const builder = new ElementsBuilder(heightSize)

  builder.center({ type: TypeNodeOnTx.NetworkNode, entity: networkNode, id: networkNode.alias })

  const { trades, contractTrades, accounts } = txSettlement

  const { nodes, edges } = getNotesAndEdges(trades, contractTrades || [])

  nodes.forEach((node) => {
    const entity = accounts?.[node.address] || {
      alias: abbreviateString(node.address, 6, 4),
      address: node.address,
      href: getExplorerUrl(networkId, 'contract', node.address),
    }
    const type = node.isHyperNode ? TypeNodeOnTx.Dex : TypeNodeOnTx.Token
    builder.node({ entity, id: node.address, type }, networkNode.alias)
  })
  edges.forEach((edge) => {
    const source = {
      id: edge.from,
      type: edge.hyperNode === 'from' ? TypeNodeOnTx.Dex : TypeNodeOnTx.Token,
    }
    const target = {
      id: edge.to,
      type: edge.hyperNode === 'to' ? TypeNodeOnTx.Dex : TypeNodeOnTx.Token,
    }
    const label = getLabel(edge)
    const kind = edge.trade ? TypeEdgeOnTx.user : TypeEdgeOnTx.amm
    builder.edge(source, target, label, kind)
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined,
  )
}

function getLabel(edge: Edge): string {
  if (edge.trade) {
    return edge.trade.orderUid.slice(0, 6)
  } else if (edge.hyperNode) {
    return ''
  } else if (edge.toTransfer && edge.fromTransfer) {
    return `${edge.fromTransfer.value} ${edge.fromTransfer.token.slice(0, 6)} -> ${
      edge.toTransfer.value
    } ${edge.toTransfer.token.slice(0, 6)}`
  }
  return 'add transfer info'
}
