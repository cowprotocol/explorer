import { useState, useCallback, useEffect } from 'react'

import { Network } from 'types'
import { getTradesAccount, getTradesAndTransfers, Trade, Transfer, Account, ALIAS_TRADER_NAME } from 'api/tenderly'
import { useMultipleErc20 } from './useErc20'
import { SingleErc20State } from 'state/erc20'
import { Order } from 'api/operator'
import BigNumber from 'bignumber.js'
import { usePrevious } from './usePrevious'

interface TxBatchTrades {
  trades: Trade[]
  transfers: Transfer[]
}

type Dict<T> = Record<string, T>

type AccountWithReceiver = Account & { owner?: string; uids?: string[] }
type Accounts = Dict<AccountWithReceiver> | undefined

export interface Settlement {
  tokens: Dict<SingleErc20State>
  accounts: Accounts
  transfers: Array<Transfer>
  trades: Array<Trade>
}

export type GetTxBatchTradesResult = {
  txSettlement: Settlement
  error: string
  isLoading: boolean
}

const getGroupedByTransfers = (arr: Transfer[]): Transfer[] => {
  return [
    ...arr
      .reduce((r, t) => {
        const key = `${t.token}-${t.from}-${t.to}`

        const item =
          r.get(key) ||
          Object.assign({}, t, {
            value: new BigNumber(0),
          })

        item.value = BigNumber.sum(item.value, new BigNumber(t.value))

        return r.set(key, item)
      }, new Map())
      .values(),
  ]
}

export function useTxBatchTrades(
  networkId: Network | undefined,
  txHash: string,
  orders: Order[] | undefined,
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

  const _fetchTxTrades = useCallback(async (network: Network, _txHash: string, orders: Order[]): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const { transfers, trades } = await getTradesAndTransfers(network, _txHash)
      const _accounts: Accounts = Object.fromEntries(await getTradesAccount(network, _txHash, trades, transfers))
      const filteredOrders = orders?.filter((order) => _accounts[order.owner])
      const orderOwnersReceivers = [
        ...(filteredOrders?.map((order) => order.owner) || []),
        ...(filteredOrders?.map((order) => order.receiver) || []),
      ]
      const groupedByTransfers = getGroupedByTransfers(transfers)
      const transfersWithKind: Transfer[] = groupedByTransfers.filter(
        (transfer) => !orderOwnersReceivers.includes(transfer.from) && !orderOwnersReceivers.includes(transfer.to),
      )
      filteredOrders?.forEach((order) => {
        const { owner, kind, receiver } = order
        if (!orderOwnersReceivers.includes(owner)) return
        transfersWithKind.push(
          ...groupedByTransfers
            .filter((t) => [t.from, t.to].includes(owner))
            .map((transfer) => ({ ...transfer, kind })),
        )

        transfersWithKind.push(
          ...groupedByTransfers
            .filter((t) => [t.from, t.to].includes(receiver))
            .map((transfer) => ({ ...transfer, kind })),
        )
        orderOwnersReceivers.splice(orderOwnersReceivers.indexOf(owner), 1)
        orderOwnersReceivers.splice(orderOwnersReceivers.indexOf(receiver), 1)
      })

      const accountsWithReceiver = _accounts
      filteredOrders?.forEach((order) => {
        if (!(order.receiver in _accounts)) {
          accountsWithReceiver[order.receiver] = {
            alias: ALIAS_TRADER_NAME,
          }
        }
        accountsWithReceiver[order.receiver] = {
          ...accountsWithReceiver[order.receiver],
          owner: order.owner,
        }
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
  }, [])

  useEffect(() => {
    if (!networkId || !txOrders) {
      return
    }

    _fetchTxTrades(networkId, txHash, JSON.parse(txOrders))
  }, [_fetchTxTrades, networkId, txHash, txOrders])

  return {
    txSettlement: { ...txBatchTrades, tokens: valueErc20s, accounts },
    error,
    isLoading: isLoading || areErc20Loading,
  }
}
