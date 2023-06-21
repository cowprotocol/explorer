import { TransactionData } from 'hooks/useTransactionData'
import { Network } from 'types'
import { Order } from 'api/operator'
import { useMemo } from 'react'
import { useMultipleErc20 } from 'hooks/useErc20'
import { GetTxBatchTradesResult } from 'hooks/useContractBasedVisualizationData'
import { traceToTransfersAndTrades } from 'api/tenderly'
import { getContractTrades, getTokenAddress } from '.'
import { abbreviateString } from 'utils'
import { getExplorerUrl } from 'utils/getExplorerUrl'

// TODO: turn this into a fn, no need to be a hook since the data is loaded outside
export function useTokenBasedVisualizationData(
  networkId: Network | undefined,
  // TODO: use orders obj for calculating the receivers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _orders: Order[] | undefined,
  txData: TransactionData,
  // TODO: reusing the same type as the other hook. Refactor and merge hooks/simplify them
): GetTxBatchTradesResult {
  const { trace, contracts, isLoading: isTxDataLoading, error: txDataError } = txData

  const { trades: userTrades, transfers } = useMemo(() => {
    if (!trace) return { trades: [], transfers: [] }

    return traceToTransfersAndTrades(trace)
  }, [trace])

  const contractTrades = useMemo(() => {
    return getContractTrades(userTrades, transfers)
  }, [transfers, userTrades])

  const tokenAddresses = useMemo(() => {
    const addressesSet = transfers.reduce((set, transfer) => {
      set.add(getTokenAddress(transfer.token, networkId || 1))
      return set
    }, new Set<string>())

    return Array.from(addressesSet)
  }, [networkId, transfers])

  const { value: tokens, isLoading: areTokensLoading } = useMultipleErc20({ networkId, addresses: tokenAddresses })

  const accounts = useMemo(() => {
    return tokenAddresses.reduce((acc, address) => {
      const symbol = tokens?.[address]?.symbol

      acc[address] = {
        alias: symbol || abbreviateString(address, 6, 4),
        address,
        href: !networkId ? undefined : getExplorerUrl(networkId, 'token', address),
      }

      return acc
    }, {})
  }, [networkId, tokenAddresses, tokens])

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
