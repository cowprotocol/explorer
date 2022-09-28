import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { fetchSolversInfo } from 'utils/fetchSolversInfo'

export const useGetSolvers = (
  networkId: SupportedChainId = SupportedChainId.MAINNET,
  initData: Solver[],
): GetSolverResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [solvers, setSolvers] = useState<Solver[]>(initData)
  const shouldRefetch = !initData.length

  const fetchSolvers = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      setSolvers([])
      try {
        const response = await COW_SDK.cowSubgraphApi.runQuery<{
          users: Pick<Solver, 'id' | 'address' | 'numberOfTrades' | 'solvedAmountUsd'>[]
        }>(GET_SOLVERS_QUERY, undefined, { chainId: network })
        if (response) {
          const solversWithInfo = await addExtraInfo(response.users, networkId)
          const totalVolumeUsd = solversWithInfo.reduce((prev, current) => prev + Number(current.solvedAmountUsd), 0)
          setSolvers(
            totalVolumeUsd > 0
              ? solversWithInfo.sort((a, b) => b.solvedAmountUsd - a.solvedAmountUsd)
              : solversWithInfo.sort((a, b) => b.numberOfSettlements - a.numberOfSettlements),
          )
        }
      } catch (e) {
        const msg = `Failed to fetch tokens`
        console.error(msg, e)
        setError({ message: msg, type: 'error' })
      } finally {
        setIsLoading(false)
      }
    },
    [networkId],
  )

  useEffect(() => {
    if (!networkId || !shouldRefetch) {
      return
    }

    fetchSolvers(networkId)
  }, [fetchSolvers, networkId, shouldRefetch])

  return { solvers, error, isLoading }
}

const addExtraInfo = async (
  solvers: Pick<Solver, 'id' | 'address' | 'numberOfTrades' | 'solvedAmountUsd'>[],
  network: SupportedChainId,
): Promise<Solver[]> => {
  const solversInfo = await fetchSolversInfo(network)
  return await Promise.all(
    solvers.map(async (solver) => {
      const sInfo = solversInfo.find((s) => s.address === solver.address)
      const { settlements } = await COW_SDK.cowSubgraphApi.runQuery<{ settlements: Settlement[] }>(
        GET_SETTLEMENTS_QUERY,
        { solver: solver.id },
        { chainId: network },
      )
      return {
        ...solver,
        numberOfSettlements: settlements.length,
        ...sInfo,
      }
    }),
  )
}

export type Solver = {
  id: string
  address: string
  name?: string
  environment?: string
  numberOfTrades: number
  numberOfSettlements: number
  solvedAmountUsd: number
}

export type Settlement = {
  id: string
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

export const GET_SETTLEMENTS_QUERY = gql`
  query GetSettlements($solver: String) {
    settlements(where: { solver: $solver }) {
      id
    }
  }
`

type GetSolverResult = {
  solvers: Solver[]
  error?: UiError
  isLoading: boolean
}
