import React, { useEffect, useState, useRef } from 'react'
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
  timestamp: number
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
      timestamp: parseInt(item.timestamp),
      volumeUsd: parseFloat(item.volumeUsd),
    })),
    currentVolume: parseFloat(_data[_data.length - 1].volumeUsd),
    changedVolume: parseFloat(_data[_data.length - 2].volumeUsd),
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
      DELAY_SECONDS * 1000,
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
const WrapperVolumeChart = styled.div`
  height: 19.6rem;
`

export function VolumeChartWidget(): JSX.Element {
  const volumeData = useGetVolumeData()
  const containerRef = useRef<HTMLDivElement>(null)

  // update the width on a window resize
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(containerRef.current?.getBoundingClientRect().width)
  React.useLayoutEffect(() => {
    if (!isClient || containerRef.current === null) return

    function updatePosition(): void {
      setWidth(containerRef.current?.getBoundingClientRect().width)
    }
    window.addEventListener('resize', updatePosition)
    updatePosition()

    return (): void => window.removeEventListener('resize', updatePosition)
  }, [isClient, width])

  return (
    <WrapperVolumeChart ref={containerRef}>
      <VolumeChart title="CoW Volume" volumeData={volumeData} width={width}></VolumeChart>
    </WrapperVolumeChart>
  )
}

export function StatsSummaryCardsWidget(): JSX.Element {
  const summary = useGetTotalSummary()

  return (
    <Wrapper>
      <SummaryCards summaryData={summary}>
        <VolumeChartWidget />
      </SummaryCards>
    </Wrapper>
  )
}
