import { Network } from 'types'
import { Contract, Trace } from 'api/tenderly/types'
import { useCallback, useEffect, useState } from 'react'
import { getTransactionContracts, getTransactionTrace } from 'api/tenderly'

type LoadingData<T> = {
  data: T
  isLoading: boolean
  error: string
}

function useTransactionTrace(network: Network, txHash: string): LoadingData<Trace | undefined> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [trace, setTrace] = useState<Trace | undefined>()

  const fetchTrace = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      setTrace(await getTransactionTrace(network, _txHash))
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (txHash && network) {
      fetchTrace(network, txHash)
    }
  }, [network, txHash, fetchTrace])

  return { data: trace, isLoading, error }
}

function useTransactionContracts(network: Network, txHash: string): LoadingData<Contract[]> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])

  const fetchContracts = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      setContracts(await getTransactionContracts(network, _txHash))
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (txHash && network) {
      fetchContracts(network, txHash)
    }
  }, [network, txHash, fetchContracts])

  return { data: contracts, isLoading, error }
}

export type TransactionData = {
  trace: Trace | undefined
  contracts: Contract[]
  isLoading: boolean
  error: string
}

export function useTransactionData(network: Network, txHash: string): TransactionData {
  const traceData = useTransactionTrace(network, txHash)
  const contractsData = useTransactionContracts(network, txHash)

  return {
    trace: traceData.data,
    contracts: contractsData.data,
    isLoading: traceData.isLoading || contractsData.isLoading,
    error: traceData.error || contractsData.error,
  }
}
