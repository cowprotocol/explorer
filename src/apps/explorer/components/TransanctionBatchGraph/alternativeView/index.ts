import { Trade, Transfer } from 'api/tenderly'

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
}

export type NodesAndEdges = {
  nodes: Node[]
  edges: Edge[]
}

export function getNotesAndEdges(userTrades: Trade[], contractTrades: ContractTrade[]): NodesAndEdges {
  const nodes: Record<string, { address: string; isHyperNode?: boolean }> = {}
  const edges: { from: string; to: string }[] = []

  userTrades.forEach((trade) => {
    nodes[trade.sellToken] = { address: trade.sellToken }
    nodes[trade.buyToken] = { address: trade.buyToken }

    // one edge for each user trade
    edges.push({ from: trade.sellToken, to: trade.buyToken })
  })

  contractTrades.forEach((trade) => {
    // add all sellTokens from contract trades to nodes
    trade.sellTokens.forEach((address) => (nodes[address] = { address }))
    // add all buyTokens from contract trades to nodes
    trade.buyTokens.forEach((address) => (nodes[address] = { address }))

    if (trade.sellTokens.length === 1 && trade.buyTokens.length === 1) {
      // no need to add a new node
      // normal edge for normal contract interaction
      edges.push({ from: trade.sellTokens[0], to: trade.buyTokens[0] })
    } else if (trade.sellTokens.length > 1 || trade.buyTokens.length > 1) {
      // if  there are more than one sellToken or buyToken, the contract becomes a node
      nodes[trade.address] = { address: trade.address, isHyperNode: true }

      // one edge for each sellToken
      trade.sellTokens.forEach((address) => edges.push({ from: address, to: trade.address }))
      // one edge for each buyToken
      trade.buyTokens.forEach((address) => edges.push({ from: trade.address, to: address }))
    }
  })

  return {
    nodes: Object.values(nodes),
    edges,
  }
}
