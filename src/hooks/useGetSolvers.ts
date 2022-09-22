import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { ACTIVE_SOLVERS } from 'apps/explorer/pages/Solver/data'

export const useGetSolvers = (networkId: SupportedChainId = SupportedChainId.MAINNET): GetSolverResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [solvers, setSolvers] = useState<Solver[]>([])

  const fetchSolvers = useCallback(async (network: Network): Promise<void> => {
    setIsLoading(true)
    setSolvers([])
    try {
      const response = await COW_SDK.cowSubgraphApi.runQuery<{ users: Pick<Solver, 'id' | 'address'>[] }>(
        GET_SOLVERS_QUERY,
        undefined,
        { chainId: network },
      )
      if (response) {
        console.log(response)
        const solversWithInfo = addExtraInfo(response.users)
        setSolvers(solversWithInfo)
      }
    } catch (e) {
      const msg = `Failed to fetch tokens`
      console.error(msg, e)
      setError({ message: msg, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!networkId) {
      return
    }

    fetchSolvers(networkId)
  }, [fetchSolvers, networkId])

  return { solvers, error, isLoading }
}

const addExtraInfo = (solvers: Pick<Solver, 'id' | 'address'>[]): Solver[] => {
  return solvers.map((solver) => {
    return {
      ...solver,
      ...ACTIVE_SOLVERS[solver.address],
    }
  })
}

export type Solver = {
  id: string
  address: string
  name: string
  environment: string
  numberOfTrades: number
  solvedAmountUsd: number
}

export const GET_SOLVERS_QUERY = gql`
  query GetSolvers {
    users(first: 100, where: { isSolver: true }) {
      id
      address
      numberOfTrades
      solvedAmountUsd
    }
  }
`

type GetSolverResult = {
  solvers: Solver[]
  error?: UiError
  isLoading: boolean
}
