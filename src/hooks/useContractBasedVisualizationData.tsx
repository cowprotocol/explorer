import {
  Trade,
  Transfer,
  Account,
  getAliasFromAddress,
  Contract,
  traceToTransfersAndTrades,
  accountAddressesInvolved,
} from 'api/tenderly'
import { SingleErc20State } from 'state/erc20'
import BigNumber from 'bignumber.js'
import { getExplorerUrl } from 'utils/getExplorerUrl'
import { ContractTrade } from 'apps/explorer/components/TransanctionBatchGraph/alternativeView'
import { BuildSettlementParams } from 'apps/explorer/components/TransanctionBatchGraph/alternativeView/hooks'

type Dict<T> = Record<string, T>

type AccountWithReceiver = Account & { owner?: string; uids?: string[] }
export type Accounts = Dict<AccountWithReceiver> | undefined

export interface Settlement {
  tokens: Dict<SingleErc20State>
  accounts: Accounts
  transfers: Array<Transfer>
  trades: Array<Trade>
  // TODO: this is a big mix of types, refactor!!!
  contractTrades?: Array<ContractTrade>
  contracts?: Array<Contract>
}

export type GetTxBatchTradesResult = {
  txSettlement: Settlement | undefined
  error: string
  isLoading: boolean
}

/**
 * Group transfers by token, from and to
 */
function groupTransfers(arr: Transfer[]): Transfer[] {
  return [
    ...arr
      .reduce((r, t) => {
        const key = `${t.token}-${t.from}-${t.to}`

        const item =
          r.get(key) ||
          Object.assign({}, t, {
            value: new BigNumber(0),
          })

        item.value = BigNumber.sum(new BigNumber(item.value), new BigNumber(t.value)).toString()

        return r.set(key, item)
      }, new Map<string, Transfer>())
      .values(),
  ]
}

export function buildContractBasedSettlement(params: BuildSettlementParams): Settlement | undefined {
  const { networkId, orders, txData, tokens } = params
  const { trace, contracts } = txData

  if (!networkId || !orders || !trace || !contracts) {
    return undefined
  }

  const { trades, transfers } = trace ? traceToTransfersAndTrades(trace) : { trades: [], transfers: [] }
  const _accounts: Accounts = Object.fromEntries(accountAddressesInvolved(contracts, trades, transfers))
  const filteredOrders = orders.filter((order) => _accounts[order.owner])

  const ownersAndReceivers = filteredOrders.reduce<Set<string>>((_set, { owner, receiver }) => {
    _set.add(owner)
    _set.add(receiver)

    return _set
  }, new Set<string>())

  const groupedTransfers = groupTransfers(transfers)
  const transfersWithKind: Transfer[] = groupedTransfers.filter(
    (transfer) => !ownersAndReceivers.has(transfer.from) && !ownersAndReceivers.has(transfer.to),
  )
  filteredOrders?.forEach((order) => {
    const { owner, kind, receiver } = order
    if (!ownersAndReceivers.has(owner)) return
    transfersWithKind.push(
      ...groupedTransfers.filter((t) => [t.from, t.to].includes(owner)).map((transfer) => ({ ...transfer, kind })),
    )

    transfersWithKind.push(
      ...groupedTransfers.filter((t) => [t.from, t.to].includes(receiver)).map((transfer) => ({ ...transfer, kind })),
    )
    ownersAndReceivers.delete(owner)
    ownersAndReceivers.delete(receiver)
  })

  const accountsWithReceiver = _accounts

  filteredOrders.forEach((order) => {
    if (!(order.receiver in _accounts)) {
      accountsWithReceiver[order.receiver] = {
        alias: getAliasFromAddress(order.receiver),
        address: order.receiver,
      }
    }
    accountsWithReceiver[order.receiver] = {
      ...accountsWithReceiver[order.receiver],
      owner: order.owner,
    }
  })
  Object.values(accountsWithReceiver).forEach((account) => {
    if (account.address) account.href = getExplorerUrl(networkId, 'address', account.address)
  })

  const tokenAddresses = transfersWithKind.map((transfer: Transfer): string => transfer.token)
  const accounts = accountsWithReceiver

  const filteredTokens = Object.keys(tokens).reduce((acc, token) => {
    if (tokenAddresses.includes(token)) {
      acc[token] = tokens[token]
    }
    return acc
  }, {})

  return {
    transfers: transfersWithKind,
    tokens: filteredTokens,
    trades,
    accounts,
  }
}
