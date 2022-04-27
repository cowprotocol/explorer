import { UTCTimestamp } from 'lightweight-charts'
import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'

import { PeriodButton, VolumeChart, VolumeItem, VolumeDataResponse } from './VolumeChart'
import volumeDataJson from './volumeData.json'

const WrapperVolumeChart = styled.div`
  height: 19.6rem;
`
export enum VolumePeriod {
  DAILY = '1D',
  WEEKLY = '1W',
  MONTHLY = '1M',
  YEARLY = '1Y',
}

type RawVolumeItem = Pick<VolumeItem, 'id'> & {
  timestamp: string
  volumeUsd: string
}

// TODO move builds to a file where The graph API is called
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
      time: parseInt(item.timestamp) as UTCTimestamp,
      value: parseFloat(item.volumeUsd),
    })),
    currentVolume: parseFloat(slicedData[slicedData.length - 1].volumeUsd),
    changedVolume: parseFloat(slicedData[slicedData.length - 2].volumeUsd),
  }
}

function useGetVolumeData(volumeTimePeriod = VolumePeriod.DAILY): VolumeDataResponse | undefined {
  const [volumeData, setVolumeDataJson] = useState<VolumeDataResponse | undefined>()
  const SECONDS = 2 // Emulating API Request delay

  useEffect(() => {
    setVolumeDataJson((prevState) => {
      return { ...prevState, isLoading: true }
    })
    const timer = setTimeout(
      () => setVolumeDataJson({ ...buildVolumeData(volumeDataJson, volumeTimePeriod), isLoading: false }),
      SECONDS * 1000,
    )

    return (): void => clearTimeout(timer)
  }, [volumeTimePeriod])

  return volumeData
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
      <VolumeChart volumeData={volumeData} width={width} periodId={periodSelected}>
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
