import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { ACTIVE_SOLVERS } from 'apps/explorer/pages/Solver/data'
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
        const response = await COW_SDK.cowSubgraphApi.runQuery<{ users: Pick<Solver, 'id' | 'address'>[] }>(
          GET_SOLVERS_QUERY,
          undefined,
          { chainId: network },
        )
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
  solvers: Pick<Solver, 'id' | 'address'>[],
  network: SupportedChainId,
): Promise<Solver[]> => {
  const solversInfo = await fetchSolversInfo(network)
  return await Promise.all(
    solvers.map(async (solver) => {
      const sInfo = solversInfo.find((s) => s.address.toLowerCase() === solver.address.toLowerCase())
      return {
        ...solver,
        ...sInfo,
        ...ACTIVE_SOLVERS[solver.address],
      }
    }),
  )
}

export type Solver = {
  id: string
  address: string
  name: string
  environment: string
  numberOfTrades: number
  numberOfSettlements: number
  solvedAmountUsd: number
  lastIsSolverUpdateTimestamp: number
}

export type Settlement = {
  id: string
}

export const GET_SOLVERS_QUERY = gql`
  query GetSolvers {
    users(first: 1000, where: { isSolver: true }) {
      id
      address
      numberOfTrades
      solvedAmountUsd
      numberOfSettlements
      lastIsSolverUpdateTimestamp
    }
  }
`

type GetSolverResult = {
  solvers: Solver[]
  error?: UiError
  isLoading: boolean
}
