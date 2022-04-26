import React, { useEffect, useState, useRef } from 'react'
import styled from 'styled-components'

import { SummaryCards } from './SummaryCards'
import { PeriodButton, VolumeChart } from './VolumeChart'
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
export function buildVolumeData(
  _data: RawVolumeItem[],
  volumePeriod: VolumePeriod,
): {
  data: VolumeItem[]
  currentVolume: number
  changedVolume: number
} {
  const periods = {
    [VolumePeriod.DAILY]: 7,
    [VolumePeriod.WEEKLY]: 14,
    [VolumePeriod.MONTHLY]: 30,
    [VolumePeriod.YEARLY]: 365,
  }
  const slicedData = _data.slice(0, periods[volumePeriod])
  return {
    data: slicedData.map((item) => ({
      id: item.id,
      timestamp: parseInt(item.timestamp),
      volumeUsd: parseFloat(item.volumeUsd),
    })),
    currentVolume: parseFloat(slicedData[slicedData.length - 1].volumeUsd),
    changedVolume: parseFloat(slicedData[slicedData.length - 2].volumeUsd),
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

function useGetVolumeData(volumeTimePeriod = VolumePeriod.DAILY): VolumeDataResponse | undefined {
  const [volumeData, setVolumeDataJson] = useState<VolumeDataResponse | undefined>()

  useEffect(() => {
    setVolumeDataJson((prevState) => {
      return { ...prevState, isLoading: true }
    })
    const timer = setTimeout(
      () => setVolumeDataJson({ ...buildVolumeData(volumeDataJson, volumeTimePeriod), isLoading: false }),
      DELAY_SECONDS * 1000,
    )

    return (): void => clearTimeout(timer)
  }, [volumeTimePeriod])

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

export enum VolumePeriod {
  DAILY = '1D',
  WEEKLY = '1W',
  MONTHLY = '1M',
  YEARLY = '1Y',
}

export function VolumeChartWidget(): JSX.Element {
  const [periodSelected, setVolumeTimePeriod] = useState(VolumePeriod.DAILY)
  const volumeData = useGetVolumeData(periodSelected)
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
      <VolumeChart title="CoW Volume" volumeData={volumeData} width={width} periodId={periodSelected}>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.DAILY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.DAILY)}
        >
          {VolumePeriod.DAILY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.WEEKLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.WEEKLY)}
        >
          {VolumePeriod.WEEKLY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.MONTHLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.MONTHLY)}
        >
          {VolumePeriod.MONTHLY}
        </PeriodButton>
        <PeriodButton
          isLoading={volumeData?.isLoading}
          active={periodSelected === VolumePeriod.YEARLY}
          onClick={(): void => setVolumeTimePeriod(VolumePeriod.YEARLY)}
        >
          {VolumePeriod.YEARLY}
        </PeriodButton>
      </VolumeChart>
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
