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
