import { Trade, Transfer } from 'api/tenderly'
import { Settlement as TxSettlement } from 'hooks/useContractBasedVisualizationData'
import { Network } from 'types'
import { ElementDefinition } from 'cytoscape'
import { networkOptions } from 'components/NetworkSelector'
import ElementsBuilder, { buildGridLayout } from 'apps/explorer/components/TransanctionBatchGraph/elementsBuilder'
import { TypeEdgeOnTx, TypeNodeOnTx } from 'apps/explorer/components/TransanctionBatchGraph/types'
import { getExplorerUrl } from 'utils/getExplorerUrl'
import { abbreviateString, FormatAmountPrecision, formattingAmountPrecision } from 'utils'
import { SingleErc20State } from 'state/erc20'
import { TOKEN_SYMBOL_UNKNOWN } from 'apps/explorer/const'
import BigNumber from 'bignumber.js'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NATIVE_TOKEN_ADDRESS_LOWERCASE, WRAPPED_NATIVE_ADDRESS } from 'const'

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

function isRoutingTrade(contractTrade: ContractTrade): boolean {
  const token_balances: { [key: string]: bigint } = {}
  contractTrade.sellTransfers.forEach((transfer) => {
    token_balances[transfer.token] = token_balances[transfer.token]
      ? token_balances[transfer.token] - BigInt(transfer.value)
      : -BigInt(transfer.value)
  })
  contractTrade.buyTransfers.forEach((transfer) => {
    token_balances[transfer.token] = token_balances[transfer.token]
      ? token_balances[transfer.token] + BigInt(transfer.value)
      : BigInt(transfer.value)
  })
  return Object.values(token_balances).every((val) => val === BigInt(0))
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

export function getNotesAndEdges(
  userTrades: Trade[],
  contractTrades: ContractTrade[],
  networkId: SupportedChainId,
): NodesAndEdges {
  const nodes: Record<string, Node> = {}
  const edges: Edge[] = []

  userTrades.forEach((trade) => {
    const sellToken = getTokenAddress(trade.sellToken, networkId)
    nodes[sellToken] = { address: sellToken }
    const buyToken = getTokenAddress(trade.buyToken, networkId)
    nodes[buyToken] = { address: buyToken }

    // one edge for each user trade
    edges.push({ from: sellToken, to: buyToken, address: trade.owner, trade })
  })

  contractTrades
    .filter((trade) => !isRoutingTrade(trade))
    .forEach((trade) => {
      // add all sellTokens from contract trades to nodes
      trade.sellTransfers.forEach(({ token }) => {
        const tokenAddress = getTokenAddress(token, networkId)
        nodes[tokenAddress] = { address: tokenAddress }
      })
      // add all buyTokens from contract trades to nodes
      trade.buyTransfers.forEach(({ token }) => {
        const tokenAddress = getTokenAddress(token, networkId)
        nodes[tokenAddress] = { address: tokenAddress }
      })

      if (trade.sellTransfers.length === 1 && trade.buyTransfers.length === 1) {
        // no need to add a new node
        // normal edge for normal contract interaction
        const sellTransfer = trade.sellTransfers[0]
        const buyTransfer = trade.buyTransfers[0]
        edges.push({
          from: getTokenAddress(sellTransfer.token, networkId),
          to: getTokenAddress(buyTransfer.token, networkId),
          address: trade.address,
          fromTransfer: sellTransfer,
          toTransfer: buyTransfer,
        })
      } else if (trade.sellTransfers.length > 1 || trade.buyTransfers.length > 1) {
        // if  there are more than one sellToken or buyToken, the contract becomes a node
        nodes[trade.address] = { address: trade.address, isHyperNode: true }

        // one edge for each sellToken
        trade.sellTransfers.forEach((transfer) =>
          edges.push({
            from: getTokenAddress(transfer.token, networkId),
            to: trade.address,
            address: trade.address,
            hyperNode: 'to',
            fromTransfer: transfer,
          }),
        )
        // one edge for each buyToken
        trade.buyTransfers.forEach((transfer) =>
          edges.push({
            from: trade.address,
            to: getTokenAddress(transfer.token, networkId),
            address: trade.address,
            hyperNode: 'from',
            toTransfer: transfer,
          }),
        )
      }
    })

  return {
    nodes: Object.values(nodes),
    edges,
  }
}

export function getTokenAddress(address: string, networkId: SupportedChainId): string {
  if (address.toLowerCase() === NATIVE_TOKEN_ADDRESS_LOWERCASE) {
    return WRAPPED_NATIVE_ADDRESS[networkId].toLowerCase()
  }
  return address
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

  const { trades, contractTrades, accounts, contracts, tokens } = txSettlement

  const contractsMap =
    contracts?.reduce((acc, contract) => {
      acc[contract.address] = contract.contract_name
      return acc
    }, {}) || {}

  const { nodes, edges } = getNotesAndEdges(trades, contractTrades || [], networkId)

  nodes.forEach((node) => {
    const entity = accounts?.[node.address] || {
      alias: abbreviateString(node.address, 6, 4),
      address: node.address,
      href: getExplorerUrl(networkId, 'contract', node.address),
    }
    const type = node.isHyperNode ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token
    builder.node({ entity, id: node.address, type }, networkNode.alias)
  })
  edges.forEach((edge) => {
    const source = {
      id: edge.from,
      type: edge.hyperNode === 'from' ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token,
    }
    const target = {
      id: edge.to,
      type: edge.hyperNode === 'to' ? TypeNodeOnTx.Hyper : TypeNodeOnTx.Token,
    }
    const label = getLabel(edge, contractsMap)
    const kind = edge.trade ? TypeEdgeOnTx.user : TypeEdgeOnTx.amm
    const tooltip = getTooltip(edge, tokens)
    builder.edge(source, target, label, kind, tooltip)
  })

  return builder.build(
    layout === 'grid'
      ? buildGridLayout(builder._countNodeTypes as Map<TypeNodeOnTx, number>, builder._center, builder._nodes)
      : undefined,
  )
}

function getLabel(edge: Edge, contractsMap: Record<string, string>): string {
  if (edge.trade) {
    return abbreviateString(edge.trade.orderUid, 6, 4)
  } else if (edge.hyperNode) {
    return ''
  } else if (edge.toTransfer && edge.fromTransfer) {
    return contractsMap[edge.address] || abbreviateString(edge.address, 6, 4)
  }
  return 'add transfer info'
}

function getTooltip(edge: Edge, tokens: Record<string, SingleErc20State>): Record<string, string> {
  const tooltip = {}

  const fromToken = tokens[edge.from]
  const toToken = tokens[edge.to]

  if (edge.trade) {
    tooltip['order-id'] = edge.trade.orderUid
    tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.trade.sellAmount)
    tooltip['bought'] = getTokenTooltipAmount(toToken, edge.trade.buyAmount)
  } else if (edge.hyperNode) {
    if (edge.fromTransfer) {
      tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.fromTransfer?.value)
    }
    if (edge.toTransfer) {
      tooltip['bought'] = getTokenTooltipAmount(toToken, edge.toTransfer?.value)
    }
  } else {
    tooltip['sold'] = getTokenTooltipAmount(fromToken, edge.fromTransfer?.value)
    tooltip['bought'] = getTokenTooltipAmount(toToken, edge.toTransfer?.value)
  }

  return tooltip
}

function getTokenTooltipAmount(token: SingleErc20State, value: string | undefined): string {
  let amount
  if (token?.decimals && value) {
    amount = formattingAmountPrecision(new BigNumber(value), token, FormatAmountPrecision.highPrecision)
  } else {
    amount = '-'
  }
  const tokenSymbol = token?.symbol || TOKEN_SYMBOL_UNKNOWN

  return `${amount} ${tokenSymbol}`
}
