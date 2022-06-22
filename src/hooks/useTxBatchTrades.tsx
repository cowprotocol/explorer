import { useState, useCallback, useEffect } from 'react'

import { Network } from 'types'
import { getTradesAccount, getTradesAndTransfers, Trade, Transfer, Account } from 'api/tenderly'
import { useMultipleErc20 } from './useErc20'
import { SingleErc20State } from 'state/erc20'
import { Order } from 'api/operator'
import { usePrevious } from './usePrevious'

interface TxBatchTrades {
  trades: Trade[]
  transfers: Transfer[]
}

type Dict<T> = Record<string, T>

type Accounts = Dict<Account> | undefined

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

export function useTxBatchTrades(
  networkId: Network | undefined,
  txHash: string,
  orders: Order[] | undefined,
): GetTxBatchTradesResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [txBatchTrades, setTxBatchTrades] = useState<TxBatchTrades>({ trades: [], transfers: [] })
  const [accounts, setAccounts] = useState<Accounts>()
  const txOrders = usePrevious(JSON.stringify(orders?.map((o) => ({ owner: o.owner, kind: o.kind })))) // We need to do a deep comparison here to avoid useEffect to be called twice (Orders array is populated partially from different places)
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })

  const _fetchTxTrades = useCallback(async (network: Network, _txHash: string, orders: Order[]): Promise<void> => {
    setIsLoading(true)
    setError('')

    try {
      const { transfers, trades } = await getTradesAndTransfers(network, _txHash)
      const _accounts = Object.fromEntries(await getTradesAccount(network, _txHash, trades, transfers))
      const orderIds = orders.map((order) => order.owner) || []
      const transfersWithKind: Transfer[] = transfers.reduce(
        (acc, transfer) =>
          !orderIds.includes(transfer.from) && !orderIds.includes(transfer.to) ? [...acc, transfer] : acc,
        [],
      )

      orders.forEach((order) => {
        const { owner, kind } = order
        transfersWithKind.push(
          ...transfers.filter((t) => [t.from, t.to].includes(owner)).map((transfer) => ({ ...transfer, kind })),
        )
      })
      setErc20Addresses(transfers.map((transfer: Transfer): string => transfer.token))
      setTxBatchTrades({ trades, transfers })
      setAccounts(_accounts)
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
