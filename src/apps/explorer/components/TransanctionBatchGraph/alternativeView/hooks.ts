import { TransactionData } from 'hooks/useTransactionData'
import { Network } from 'types'
import { Order } from 'api/operator'
import { Settlement } from 'hooks/useContractBasedVisualizationData'
import { traceToTransfersAndTrades } from 'api/tenderly'
import { getContractTrades, getTokenAddress } from '.'
import { abbreviateString } from 'utils'
import { getExplorerUrl } from 'utils/getExplorerUrl'
import { SingleErc20State } from 'state/erc20'

export type BuildSettlementParams = {
  networkId: Network | undefined
  tokens: Record<string, SingleErc20State>
  orders?: Order[] | undefined
  txData: TransactionData
}

export function buildTokenBasedSettlement(params: BuildSettlementParams): Settlement | undefined {
  const { networkId, txData, tokens } = params
  const { trace, contracts } = txData

  if (!networkId || !trace || !contracts) {
    return undefined
  }

  const { trades, transfers } = traceToTransfersAndTrades(trace)
  const contractTrades = getContractTrades(trades, transfers)

  const addressesSet = transfers.reduce((set, transfer) => {
    set.add(getTokenAddress(transfer.token, networkId || 1))
    return set
  }, new Set<string>())

  const tokenAddresses = Array.from(addressesSet)

  const accounts = tokenAddresses.reduce((acc, address) => {
    const symbol = tokens?.[address]?.symbol

    acc[address] = {
      alias: symbol || abbreviateString(address, 6, 4),
      address,
      href: getExplorerUrl(networkId, 'token', address),
    }

    return acc
  }, {})

  const filteredTokens = tokenAddresses.reduce((acc, address) => {
    const token = tokens[address]

    if (token) {
      acc[address] = token
    }

    return acc
  }, {})

  return {
    accounts,
    trades,
    contractTrades,
    transfers,
    tokens: filteredTokens,
    contracts,
  }
}
