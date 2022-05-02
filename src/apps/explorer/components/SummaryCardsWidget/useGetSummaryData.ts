import { gql } from '@apollo/client'
import { COW_SDK } from 'const'
import { useEffect, useState } from 'react'
import { useNetworkId } from 'state/network'
import { Network } from 'types'

export interface BatchInfo {
  lastBatchDate: Date
  batchId: string
}

interface PastAndPresentValue {
  now: number
  before: number
}

interface TotalSummary {
  batchInfo?: BatchInfo
  dailyTransactions?: PastAndPresentValue
  totalTokens?: number
  dailyFees?: PastAndPresentValue
}

type SummaryQuery = {
  settlements: Array<{ firstTradeTimestamp: string; txHash: string }>
  hourlyTotals: Array<{ orders: string; feesUsd: string }>
  totals: Array<{ tokens: string }>
}

function buildSummary(data: SummaryQuery): TotalSummary {
  const batchInfo: BatchInfo = {
    lastBatchDate: new Date(Number(data.settlements[0].firstTradeTimestamp) * 1000),
    batchId: data.settlements[0].txHash,
  }

  const now = getTransactionsAndFees(data.hourlyTotals.slice(0, 24))
  const before = getTransactionsAndFees(data.hourlyTotals.slice(24, 48))

  const dailyTransactions: PastAndPresentValue = {
    before: before.transactions,
    now: now.transactions,
  }

  const dailyFees: PastAndPresentValue = {
    before: before.fees,
    now: now.fees,
  }

  const totalTokens = Number(data.totals[0].tokens)

  return {
    batchInfo,
    dailyTransactions,
    dailyFees,
    totalTokens,
  }
}

function getTransactionsAndFees(data: Array<{ orders: string; feesUsd: string }>): TransactionsAndFees {
  return data.reduce(
    (acc, curr) => {
      acc.transactions += Number(curr.orders)
      acc.fees += Number(curr.feesUsd)
      return acc
    },
    { fees: 0, transactions: 0 },
  )
}

type TransactionsAndFees = {
  transactions: number
  fees: number
}

export type TotalSummaryResponse = TotalSummary & {
  isLoading: boolean
}

export function useGetSummaryData(): TotalSummaryResponse | undefined {
  const [summary, setSummary] = useState<TotalSummaryResponse | undefined>()
  const network = useNetworkId() ?? Network.MAINNET

  useEffect(() => {
    setSummary((summary) => ({ ...summary, isLoading: true }))
    // TODO: Once the sdk's runQuery method accepts DocumentNode update this
    COW_SDK[network]?.cowSubgraphApi.runQuery(summaryQuery as any).then((data: SummaryQuery) => {
      const summary = buildSummary(data)
      setSummary({ ...summary, isLoading: false })
    })
  }, [network])

  return summary
}

const summaryQuery = gql`
  query Summary {
    hourlyTotals(orderBy: timestamp, orderDirection: desc, first: 48) {
      orders
      feesUsd
    }
    settlements(orderBy: firstTradeTimestamp, orderDirection: desc, first: 1) {
      txHash
      firstTradeTimestamp
    }
    totals {
      tokens
    }
  }
`
