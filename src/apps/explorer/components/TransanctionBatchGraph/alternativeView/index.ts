import { Trade, Transfer } from 'api/tenderly'
import { Settlement as TxSettlement } from 'hooks/useTxBatchTrades'
import { Network } from 'types'
import { ElementDefinition } from 'cytoscape'
import { networkOptions } from 'components/NetworkSelector'
import ElementsBuilder, { buildGridLayout } from 'apps/explorer/components/TransanctionBatchGraph/elementsBuilder'
import { TypeEdgeOnTx, TypeNodeOnTx } from 'apps/explorer/components/TransanctionBatchGraph/types'

const ADDRESSES_TO_IGNORE = new Set()
// CoW Protocol settlement contract
ADDRESSES_TO_IGNORE.add('0x9008d19f58aabd9ed0d60971565aa8510560ab41')
// ETH Flow contract
ADDRESSES_TO_IGNORE.add('0x40a50cf069e992aa4536211b23f286ef88752187')

export type ContractTrade = {
  address: string
  sellTokens: string[]
  buyTokens: string[]
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
    const sellTokens: string[] = []
    const buyTokens: string[] = []

    transfers.forEach((transfer) => {
      if (transfer.from === address) {
        sellTokens.push(transfer.token)
      } else if (transfer.to === address) {
        buyTokens.push(transfer.token)
      }
    })

    return { address, sellTokens, buyTokens }
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
    trade.sellTokens.forEach((address) => (nodes[address] = { address }))
    // add all buyTokens from contract trades to nodes
    trade.buyTokens.forEach((address) => (nodes[address] = { address }))

    if (trade.sellTokens.length === 1 && trade.buyTokens.length === 1) {
      // no need to add a new node
      // normal edge for normal contract interaction
      edges.push({ from: trade.sellTokens[0], to: trade.buyTokens[0], address: trade.address })
    } else if (trade.sellTokens.length > 1 || trade.buyTokens.length > 1) {
      // if  there are more than one sellToken or buyToken, the contract becomes a node
      nodes[trade.address] = { address: trade.address, isHyperNode: true }

      // one edge for each sellToken
      trade.sellTokens.forEach((address) => edges.push({ from: address, to: trade.address, address: trade.address }))
      // one edge for each buyToken
      trade.buyTokens.forEach((address) => edges.push({ from: trade.address, to: address, address: trade.address }))
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
    const entity = accounts?.[node.address] || { alias: node.address }
    // const type = node.isHyperNode ? TypeNodeOnTx.Dex : TypeNodeOnTx.Token
    const type = TypeNodeOnTx.Token
    builder.node({ entity, id: node.address, type }, networkNode.alias)
  })
  edges.forEach((edge) => {
    const type = TypeNodeOnTx.Token
    const tooltip = edge.address.slice(0, 6)
    const kind = edge.trade ? TypeEdgeOnTx.user : TypeEdgeOnTx.amm
    builder.edge({ id: edge.from, type }, { id: edge.to, type }, tooltip, kind)
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined,
  )
}
