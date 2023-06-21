import { useState, useCallback, useEffect } from 'react'

import { Network } from 'types'
import {
  Trade,
  Transfer,
  Account,
  getAliasFromAddress,
  Contract,
  traceToTransfersAndTrades,
  Trace,
  accountAddressesInvolved,
} from 'api/tenderly'
import { useMultipleErc20 } from './useErc20'
import { SingleErc20State } from 'state/erc20'
import { Order } from 'api/operator'
import BigNumber from 'bignumber.js'
import { usePrevious } from './usePrevious'
import { getExplorerUrl } from 'utils/getExplorerUrl'
import { ContractTrade } from 'apps/explorer/components/TransanctionBatchGraph/alternativeView'
import { TransactionData } from 'hooks/useTransactionData'
import { BuildSettlementParams } from 'apps/explorer/components/TransanctionBatchGraph/alternativeView/hooks'

interface TxBatchTrades {
  trades: Trade[]
  transfers: Transfer[]
}

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

// TODO: turn this into a fn, no need to be a hook since the data is loaded outside
export function useContractBasedVisualizationData(
  networkId: Network | undefined,
  orders: Order[] | undefined,
  txData: TransactionData,
): GetTxBatchTradesResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [txBatchTrades, setTxBatchTrades] = useState<TxBatchTrades>({ trades: [], transfers: [] })
  const [accounts, setAccounts] = useState<Accounts>()
  const txOrders = usePrevious(
    JSON.stringify(orders?.map((o) => ({ owner: o.owner, kind: o.kind, receiver: o.receiver }))),
  ) // We need to do a deep comparison here to avoid useEffect to be called twice (Orders array is populated partially from different places)
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })

  const { trace, contracts } = txData

  const _fetchTxTrades = useCallback(
    async (network: Network, _orders: Order[], trace: Trace, contracts: Contract[]): Promise<void> => {
      setIsLoading(true)
      setError('')
      try {
        const { transfers, trades } = traceToTransfersAndTrades(trace)
        const _accounts: Accounts = Object.fromEntries(accountAddressesInvolved(contracts, trades, transfers))
        const filteredOrders = _orders?.filter((order) => _accounts[order.owner])

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
            ...groupedTransfers
              .filter((t) => [t.from, t.to].includes(owner))
              .map((transfer) => ({ ...transfer, kind })),
          )

          transfersWithKind.push(
            ...groupedTransfers
              .filter((t) => [t.from, t.to].includes(receiver))
              .map((transfer) => ({ ...transfer, kind })),
          )
          ownersAndReceivers.delete(owner)
          ownersAndReceivers.delete(receiver)
        })

        const accountsWithReceiver = _accounts
        filteredOrders?.forEach((order) => {
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
          if (account.address) account.href = getExplorerUrl(network, 'address', account.address)
        })

        setErc20Addresses(transfersWithKind.map((transfer: Transfer): string => transfer.token))
        setTxBatchTrades({ trades, transfers: transfersWithKind })
        setAccounts(accountsWithReceiver)
      } catch (e) {
        const msg = `Failed to fetch tx batch trades`
        console.error(msg, e)
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!networkId || !txOrders || !trace || !contracts) {
      return
    }

    _fetchTxTrades(networkId, JSON.parse(txOrders), trace, contracts)
  }, [_fetchTxTrades, contracts, networkId, trace, txOrders])

  return {
    txSettlement: { ...txBatchTrades, tokens: valueErc20s, accounts },
    error,
    isLoading: isLoading || areErc20Loading,
  }
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
