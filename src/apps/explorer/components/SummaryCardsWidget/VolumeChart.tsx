import React, { useEffect, useRef, useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'
import { format } from 'date-fns'

import { createChart, HistogramData, IChartApi } from 'lightweight-charts'
import { VolumeDataResponse, VolumeItem } from '.'
import { calcDiff, getColorBySign } from 'components/common/Card/card.utils'
import { formatSmart } from 'utils'
import GraphSkeleton from 'assets/img/graph-skeleton.svg'

const DEFAULT_CHART_HEIGHT = 196 // px

export interface VolumeChartProps {
  title: string
  volumeData: VolumeDataResponse | undefined
  height?: number
  width?: number
}

const Wrapper = styled.div`
  position: relative;

  .timeSelector {
    position: absolute;
    top: 1rem;
    right: 1rem;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-size: small;
    color: ${({ theme }): string => theme.grey};
    > li {
      float: left;
      display: block;
      color: white;
      text-align: center;
      padding: 0 1.5rem;
      text-decoration: none;
    }
  }

  .floating-tooltip {
    width: 96px;
    height: 300px;
    position: absolute;
    display: none;
    padding: 8px;
    box-sizing: border-box;
    font-size: 12px;
    color: '#20262E';
    background-color: rgba(255, 255, 255, 0.23);
    text-align: left;
    z-index: 1000;
    top: 12px;
    left: 12px;
    pointer-events: none;
    border-radius: 4px 4px 0px 0px;
    border-bottom: none;
    box-shadow: 0 2px 5px 0 rgba(117, 134, 150, 0.45);
  }
`

const ContainerTitle = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  > h3 {
    color: ${({ theme }): string => theme.grey};
    font-size: small;
    font-weight: ${({ theme }): string => theme.fontMedium};
    margin: 0px;
  }

  > span {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin: 0;
    padding: 0;
    align-items: center;
    > p {
      color: ${({ theme }): string => theme.white};
      font-size: large;
      font-weight: ${({ theme }): string => theme.fontBold};
      &.caption {
        font-size: 1.1rem;
        color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.grey)};
      }
    }
  }
`
const ChartSkeleton = styled.div`
  margin: 1rem;
  height: 100%;
  width: 100%;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.4rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-content: center;
  background: url(${GraphSkeleton}) no-repeat bottom/contain ${({ theme }): string => theme.greyOpacity};
  opacity: 0.35;

  h2 {
    margin: 3rem 0;
  }
`

function formatChartData(data: VolumeItem[]): HistogramData[] {
  return data?.map((item) => ({
    time: format(item.timestamp, 'yyyy-MM-dd'),
    value: item.volumeUsd,
  }))
}

function _buildChart(
  chartContainer: HTMLDivElement,
  width: number | undefined,
  height: number,
  theme: DefaultTheme,
): IChartApi {
  return createChart(chartContainer, {
    width,
    height,
    layout: {
      backgroundColor: 'transparent',
      textColor: theme.textPrimary1,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.5,
        bottom: 0.2,
      },
      visible: false,
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: false,
    },
    grid: {
      horzLines: {
        visible: false,
      },
      vertLines: {
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: false,
        labelVisible: true,
      },
      vertLine: {
        visible: true,
        style: 3,
        width: 1,
        color: theme.borderPrimary,
        labelVisible: true,
      },
    },
  })
}

export function VolumeChart({
  volumeData,
  height = DEFAULT_CHART_HEIGHT,
  width = undefined,
}: VolumeChartProps): JSX.Element {
  const { data: items, currentVolume, changedVolume, isLoading } = volumeData || {}
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null>(null)
  const theme = useTheme()
  const diffPercentageVolume = currentVolume && changedVolume && calcDiff(currentVolume, changedVolume)
  const captionColor = getColorBySign(diffPercentageVolume || 0)

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !items) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      lineWidth: 1,
    })

    series.setData(formatChartData(items))
    setChartCreated(chart)
  }, [chartCreated, height, items, theme, width])

  if (isLoading)
    return (
      <ChartSkeleton>
        <h2>Loading...</h2>
      </ChartSkeleton>
    )

  return (
    <Wrapper ref={chartContainerRef}>
      <ContainerTitle captionColor={captionColor}>
        <h3>Cow Volume</h3>
        <span>
          <p>${currentVolume && formatSmart({ amount: currentVolume.toString(), precision: 0, decimals: 2 })}</p>
          <p className="caption">{diffPercentageVolume?.toFixed(2)}%</p>
        </span>
      </ContainerTitle>
      <ul className="timeSelector">
        <li>1D</li>
        <li>1W</li>
        <li>1M</li>
        <li>1Y</li>
      </ul>
    </Wrapper>
  )
}
