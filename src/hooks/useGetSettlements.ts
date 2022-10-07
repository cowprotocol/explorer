import { useCallback, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { TokenErc20 } from '@gnosis.pm/dex-js'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Network, UiError } from 'types'
import { COW_SDK } from 'const'
import { fetchSolversInfo } from 'utils/fetchSolversInfo'

export const useGetSettlements = (
  networkId: SupportedChainId = SupportedChainId.MAINNET,
  initData: Settlement[],
): GetSolverResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()
  const [settlements, setSettlements] = useState<Settlement[]>(initData)
  const shouldRefetch = !initData.length

  const fetchSettlements = useCallback(
    async (network: Network): Promise<void> => {
      setIsLoading(true)
      setSettlements([])
      try {
        const response = await COW_SDK.cowSubgraphApi.runQuery<{
          settlements: Settlement[]
        }>(GET_SETTLEMENTS_QUERY, undefined, { chainId: network })
        if (response) {
          const settlementsWithInfo = await addExtraInfo(response.settlements, networkId)
          setSettlements(settlementsWithInfo)
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

    fetchSettlements(networkId)
  }, [fetchSettlements, networkId, shouldRefetch])

  return { settlements, error, isLoading }
}

const addExtraInfo = async (settlements: Settlement[], network: SupportedChainId): Promise<Settlement[]> => {
  const solversInfo = await fetchSolversInfo(network)
  return settlements.map((settlement) => {
    const sInfo = solversInfo.find(
      (s: { address: string }) => s.address.toLowerCase() === settlement.solver.address.toLowerCase(),
    )
    const tokens: TokenErc20[] = []
    const addresses: string[] = []
    let totalVolumeUsd = 0
    let ethCost = 0
    settlement.trades.forEach((trade) => {
      totalVolumeUsd += Number(trade.sellAmountUsd) || Number(trade.buyAmountUsd)
      ethCost += Number(trade.feeAmount)
      if (!addresses.includes(trade.buyToken.address)) {
        tokens.push(trade.buyToken)
        addresses.push(trade.buyToken.address)
      }
      if (!addresses.includes(trade.sellToken.address)) {
        tokens.push(trade.sellToken)
        addresses.push(trade.sellToken.address)
      }
    })
    return {
      ...settlement,
      ...sInfo,
      tokens,
      ethCost,
      totalVolumeUsd,
    }
  })
}

export type Settlement = {
  id: string
  name: string
  firstTradeTimestamp: number
  txHash: string
  solver: {
    address: string
  }
  trades: Trade[]
  tokens: TokenErc20[]
  totalVolumeUsd: number
  ethCost: number
}

type Trade = {
  buyAmountUsd: string
  sellAmountUsd: string
  buyToken: TokenErc20
  sellToken: TokenErc20
  feeAmount: number
}

export const GET_SETTLEMENTS_QUERY = gql`
  query GetSettlements {
    settlements(first: 1000, orderBy: firstTradeTimestamp, orderDirection: desc) {
      id
      firstTradeTimestamp
      txHash
      solver {
        address
      }
      trades {
        sellAmountUsd
        buyAmountUsd
        feeAmount
        sellToken {
          address
          symbol
          decimals
        }
        buyToken {
          address
          symbol
        }
      }
    }
  }
`

type GetSolverResult = {
  settlements: Settlement[]
  error?: UiError
  isLoading: boolean
}
