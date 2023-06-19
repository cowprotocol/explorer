import { useTransactionData } from 'hooks/useTransactionData'
import { Network } from 'types'
import { Order } from 'api/operator'
import { useMemo } from 'react'
import { useMultipleErc20 } from 'hooks/useErc20'
import { GetTxBatchTradesResult } from 'hooks/useTxBatchTrades'
import { traceToTransfersAndTrades } from 'api/tenderly'
import { getContractTrades } from '.'

export function useTransactionSettlement(
  networkId: Network | undefined,
  txHash: string,
  // TODO: use orders obj for calculating the receivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _orders: Order[] | undefined,
  // TODO: reusing the same type as the other hook. Refactor and merge hooks/simplify them
): GetTxBatchTradesResult {
  const { trace, contracts, isLoading: isTxDataLoading, error: txDataError } = useTransactionData(networkId, txHash)

  const { trades: userTrades, transfers } = useMemo(() => {
    if (!trace) return { trades: [], transfers: [] }

    return traceToTransfersAndTrades(trace)
  }, [trace])

  const contractTrades = useMemo(() => {
    return getContractTrades(userTrades, transfers)
  }, [transfers, userTrades])

  const tokenAddresses = useMemo(() => {
    return transfers.map((transfer) => transfer.token)
  }, [transfers])

  const { value: tokens, isLoading: areTokensLoading } = useMultipleErc20({ networkId, addresses: tokenAddresses })

  const accounts = useMemo(() => {
    return tokenAddresses.reduce((acc, address) => {
      const alias = tokens?.[address]?.symbol

      acc[address] = {
        alias: alias || address,
        address,
      }

      return acc
    }, {})
  }, [tokenAddresses, tokens])

  return {
    txSettlement: {
      accounts,
      trades: userTrades,
      contractTrades,
      transfers,
      tokens,
      contracts,
    },
    isLoading: isTxDataLoading || areTokensLoading,
    error: txDataError,
  }
}
