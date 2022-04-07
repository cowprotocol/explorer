import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SummaryCards } from './SummaryCards'

import summaryData from './summaryGraphResp.json'

const DELAY_SECONDS = 3 // Emulating API request

interface TotalSummary {
  batchInfo: { lastBatchDate: string; batchId: string }
  dailyTransactions: { now: number; before: string }
  totalTokens: number
  dailyFees: { now: string; before: string }
  monthSurplus: { now: string; before: string }
}

export type TotalSummaryResponse = TotalSummary & {
  isLoading: boolean
}

function useGetTotalSummary(): TotalSummaryResponse {
  const [summary, setSummary] = useState<TotalSummaryResponse>({
    batchInfo: { lastBatchDate: '', batchId: '' },
    dailyTransactions: { now: 0, before: '' },
    totalTokens: 0,
    dailyFees: { now: '', before: '' },
    monthSurplus: { now: '', before: '' },
    isLoading: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => setSummary({ ...summaryData, isLoading: false }), DELAY_SECONDS * 1000)

    return (): void => clearTimeout(timer)
  }, [])

  return summary
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
`
const VolumeChart = styled.div`
  border: 1px red solid;
  min-height: 21rem;
  min-width: 40rem;
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
