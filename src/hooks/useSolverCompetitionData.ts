import { useCallback, useEffect, useState } from 'react'
import { Network } from 'types'
import { getSolverCompetitionByTx } from 'api/operator/operatorApi'
import { SolverCompetition } from 'api/operator'

type LoadingData<T> = {
  data: T
  isLoading: boolean
  error: string
}

const SOLVER_COMPETITION_CACHE = new Map<string, SolverCompetition>()

function getCachedData<T>(key: string, cache: Map<string, T>): T | undefined {
  return cache.get(key)
}

export function useGetSolverCompetition(
  txHash: string,
  network: Network | undefined,
): LoadingData<SolverCompetition | undefined> {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [solverCompetition, setSolverCompetition] = useState<SolverCompetition | undefined>()
  const fetchSolverCompetition = useCallback(async (network: Network, _txHash: string): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const cacheKey = `${network}-${_txHash}`
      const cachedData = getCachedData(cacheKey, SOLVER_COMPETITION_CACHE)

      if (cachedData) {
        setSolverCompetition(cachedData)
      } else {
        const solverCompetition = await getSolverCompetitionByTx({ networkId: network, txHash: _txHash })
        console.log('solverCompetition', solverCompetition)
        setSolverCompetition(solverCompetition)
        setIsLoading(false)
        SOLVER_COMPETITION_CACHE.set(cacheKey, solverCompetition)
      }
    } catch (e) {
      setError(e.message)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (txHash && network) {
      fetchSolverCompetition(network, txHash)
    }
  }, [network, txHash, fetchSolverCompetition])

  return { data: solverCompetition, isLoading, error }
}
