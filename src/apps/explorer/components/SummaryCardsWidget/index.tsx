import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { SummaryCards } from './SummaryCards'
import { VolumeChart } from './VolumeChart'
import volumeDataJson from './volumeData.json'
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

export interface VolumeItem {
  id: string
  timestamp: Date
  volumeUsd: number
}

export interface VolumeDataResponse {
  data?: VolumeItem[]
  currentVolume?: number
  changedVolume?: number
  isLoading: boolean
}

type RawVolumeItem = Omit<VolumeItem, 'timestamp' | 'volumeUsd'> & {
  timestamp: string
  volumeUsd: string
}

type RawTotalSummary = Omit<TotalSummary, 'batchInfo'> & {
  batchInfo: { lastBatchDate: number; batchId: string }
}

// TODO move builds to a file where The graph API is called
function buildSummary(data: RawTotalSummary): TotalSummary {
  return {
    ...data,
    batchInfo: {
      ...data.batchInfo,
      lastBatchDate: new Date(data.batchInfo.lastBatchDate * 1000),
    },
  }
}
export function buildVolumeData(_data: RawVolumeItem[]): {
  data: VolumeItem[]
  currentVolume: number
  changedVolume: number
} {
  return {
    data: _data.map((item) => ({
      id: item.id,
      timestamp: new Date(parseInt(item.timestamp) * 1000),
      volumeUsd: parseFloat(item.volumeUsd),
    })),
    currentVolume: parseFloat(_data[0].volumeUsd),
    changedVolume: parseFloat(_data[1].volumeUsd),
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

function useGetVolumeData(): VolumeDataResponse | undefined {
  const [volumeData, setVolumeDataJson] = useState<VolumeDataResponse | undefined>()

  useEffect(() => {
    setVolumeDataJson((prevState) => {
      return { ...prevState, isLoading: true }
    })
    const timer = setTimeout(
      () => setVolumeDataJson({ ...buildVolumeData(volumeDataJson), isLoading: false }),
      0 * 1000,
    )

    return (): void => clearTimeout(timer)
  }, [])

  return volumeData
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`
const WrappedVolumeChart = styled(VolumeChart)`
  border: 1px solid red;
  background: #28f3282c;
  border-radius: 0.4rem;
  height: 19.6rem;
  width: 100%;
`

export function StatsSummaryCardsWidget(): JSX.Element {
  const summary = useGetTotalSummary()
  const volumeData = useGetVolumeData()

  return (
    <Wrapper>
      <SummaryCards summaryData={summary}>
        <WrappedVolumeChart title="CoW Volume" volumeData={volumeData} />
      </SummaryCards>
    </Wrapper>
  )
}
