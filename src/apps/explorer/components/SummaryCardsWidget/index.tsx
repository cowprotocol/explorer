import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SummaryCards } from './SummaryCards'

import summaryData from './summaryGraphResp.json'

const DELAY_SECONDS = 3 // Emulating API request

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

type RawTotalSummary = Omit<TotalSummary, 'batchInfo'> & {
  batchInfo: { lastBatchDate: number; batchId: string }
}

function buildSummary(data: RawTotalSummary): TotalSummary {
  return {
    ...data,
    batchInfo: {
      ...data.batchInfo,
      lastBatchDate: new Date(data.batchInfo.lastBatchDate * 1000),
    },
  }
}

export type TotalSummaryResponse = TotalSummary & {
  isLoading: boolean
}

function useGetTotalSummary(): TotalSummaryResponse | undefined {
  const [summary, setSummary] = useState<TotalSummaryResponse | undefined>()

  useEffect(() => {
    setSummary((prevState) => {
      return { ...prevState, isLoading: true }
    })
    const timer = setTimeout(() => setSummary({ ...buildSummary(summaryData), isLoading: false }), DELAY_SECONDS * 1000)

    return (): void => clearTimeout(timer)
  }, [])

  return summary
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`
const VolumeChart = styled.div`
  background: #28f3282c;
  border-radius: 0.4rem;
  height: 19.6rem;
  width: 100%;
`

export function StatsSummaryCardsWidget(): JSX.Element {
  const summary = useGetTotalSummary()

  return (
    <Wrapper>
      <SummaryCards summaryData={summary}>
        <VolumeChart />
      </SummaryCards>
    </Wrapper>
  )
}
