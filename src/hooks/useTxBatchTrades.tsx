import { useState, useCallback, useEffect } from 'react'

import { Network } from 'types'
import { getTradesAccount, getTradesAndTransfers, Trade, Transfer, Account } from 'api/tenderly'
import { useMultipleErc20 } from './useErc20'
import { SingleErc20State } from 'state/erc20'

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

type GetTxBatchTradesResult = {
  txSettlement: Settlement
  error: string
  isLoading: boolean
}

export function useTxBatchTrades(
  networkId: Network | undefined,
  txHash: string,
  ordersFoundInTx: number | undefined,
): GetTxBatchTradesResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [txBatchTrades, setTxBatchTrades] = useState<TxBatchTrades>({ trades: [], transfers: [] })
  const [accounts, setAccounts] = useState<Accounts>()
  const [erc20Addresses, setErc20Addresses] = useState<string[]>([])
  const { value: valueErc20s, isLoading: areErc20Loading } = useMultipleErc20({ networkId, addresses: erc20Addresses })

  const _fetchTxTrades = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')

    try {
      const { transfers, trades } = await getTradesAndTransfers(network, _txHash)
      const _accounts = Object.fromEntries(await getTradesAccount(network, _txHash, trades, transfers))

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
    if (!networkId || !ordersFoundInTx) {
      return
    }

    _fetchTxTrades(networkId, txHash)
  }, [_fetchTxTrades, networkId, ordersFoundInTx, txHash])

  return {
    txSettlement: { ...txBatchTrades, tokens: valueErc20s, accounts },
    error,
    isLoading: isLoading || areErc20Loading,
  }
}
