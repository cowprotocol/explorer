import { TENDERLY_API_URL, ETH_NULL_ADDRESS, APP_NAME } from 'const'
import { Network } from 'types'
import { fetchQuery } from 'api/baseApi'
import {
  Account,
  Contract,
  Trace,
  PublicTrade as Trade,
  Transfer,
  TypeOfTrace,
  IndexTradeInput,
  IndexTransferInput,
  TxTradesAndTransfers,
} from './types'
import { abbreviateString } from 'utils'

export const ALIAS_TRADER_NAME = 'Trader'
const COW_PROTOCOL_CONTRACT_NAME = 'GPv2Settlement'
const API_BASE_URLs = _urlAvailableNetwork()

function _urlAvailableNetwork(): Partial<Record<Network, string>> {
  const urlNetwork = (_networkId: Network): string => `${TENDERLY_API_URL}/${_networkId}`

  return {
    [Network.Mainnet]: urlNetwork(Network.Mainnet),
    [Network.Rinkeby]: urlNetwork(Network.Rinkeby),
    [Network.xDAI]: urlNetwork(Network.xDAI),
  }
}

function _getApiBaseUrl(networkId: Network): string {
  const baseUrl = API_BASE_URLs[networkId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The tenderly API is not available in the Network ' + networkId)
  } else {
    return baseUrl
  }
}

function _get(networkId: Network, url: string): Promise<Response> {
  const baseUrl = _getApiBaseUrl(networkId)
  return fetch(baseUrl + url)
}

function _fetchTrace(networkId: Network, txHash: string): Promise<Trace> {
  const queryString = `/trace/${txHash}`
  console.log(`[tenderlyApi:fetchTrace] Fetching trace tx ${txHash} on network ${networkId}`)

  return fetchQuery<Trace>({ get: () => _get(networkId, queryString) }, queryString)
}

function _fetchTradesAccounts(networkId: Network, txHash: string): Promise<Contract[]> {
  const queryString = `/tx/${txHash}/contracts`
  console.log(`[tenderlyApi:fetchTradesAccounts] Fetching tx trades account on network ${networkId}`)

  return fetchQuery<Array<Contract>>({ get: () => _get(networkId, queryString) }, queryString)
}

export async function getTradesAndTransfers(networkId: Network, txHash: string): Promise<TxTradesAndTransfers> {
  const trace = await _fetchTrace(networkId, txHash)

  return traceToTransfersTrades(trace)
}

export function traceToTransfersTrades(trace: Trace): TxTradesAndTransfers {
  const transfers: Array<Transfer> = []
  const trades: Array<Trade> = []

  try {
    trace.logs.forEach((log) => {
      if (log.name === TypeOfTrace.TRANSFER) {
        transfers.push({
          token: log.raw.address,
          from: log.inputs[IndexTransferInput.from].value,
          to: log.inputs[IndexTransferInput.to].value,
          value: log.inputs[IndexTransferInput.value].value,
        })
      } else if (log.name === TypeOfTrace.TRADE) {
        const trade = {
          owner: log.inputs[IndexTradeInput.owner].value,
          sellToken: log.inputs[IndexTradeInput.sellToken].value,
          buyToken: log.inputs[IndexTradeInput.buyToken].value,
          sellAmount: log.inputs[IndexTradeInput.sellAmount].value,
          buyAmount: log.inputs[IndexTradeInput.buyAmount].value,
          feeAmount: log.inputs[IndexTradeInput.feeAmount].value,
          orderUid: log.inputs[IndexTradeInput.orderUid].value,
        }
        if (trade.buyToken === ETH_NULL_ADDRESS) {
          //ETH transfers are not captured by ERC20 events, so we need to manually add them to the Transfer list
          transfers.push({
            token: ETH_NULL_ADDRESS,
            from: log.raw.address,
            to: trade.owner,
            value: trade.buyAmount,
          })
        }
        trades.push(trade)
      }
    })
  } catch (error) {
    console.error(`Unable to analyze the JSON trace trades`, error)
    throw new Error(`Failed to parse the JSON of tenderly trace API`)
  }

  return { transfers, trades }
}

export async function getTradesAccount(
  networkId: Network,
  txHash: string,
  trades: Array<Trade>,
  transfers: Array<Transfer>,
): Promise<Map<string, Account>> {
  const contracts = await _fetchTradesAccounts(networkId, txHash)

  return accountAddressesInvolved(contracts, trades, transfers)
}

/**
 * Allows to obtain a description of addresses involved
 * in a tx
 */
export function accountAddressesInvolved(
  contracts: Contract[],
  trades: Array<Trade>,
  transfers: Array<Transfer>,
): Map<string, Account> {
  const result = new Map()

  try {
    contracts
      .filter((contract: Contract) => {
        // Only usecontracts which are involved in a transfer
        return transfers.find((transfer) => {
          return transfer.from === contract.address || transfer.to === contract.address
        })
      })
      .forEach((contract: Contract) => {
        result.set(contract.address, {
          alias: _contractName(contract.contract_name),
        })
      })
    trades.forEach((trade) => {
      result.set(trade.owner, {
        alias: ALIAS_TRADER_NAME,
      })
    })
    // Track any missing from/to contract as unknown
    transfers
      .flatMap((transfer) => {
        return [transfer.from, transfer.to]
      })
      .forEach((address) => {
        if (!result.get(address)) {
          result.set(address, {
            alias: abbreviateString(address, 6, 4),
          })
        }
      })
  } catch (error) {
    console.error(`Unable to set contracts details transfers and trades`, error)
    throw new Error(`Failed to parse accounts addresses of tenderly API`)
  }

  return result
}

function _contractName(name: string): string {
  if (name === COW_PROTOCOL_CONTRACT_NAME) return APP_NAME

  return name
}
