import React, { useEffect, useRef, useState } from 'react'
import styled, { DefaultTheme, useTheme, keyframes, css, FlattenSimpleInterpolation } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'

import { createChart, HistogramData, IChartApi, MouseEventParams, UTCTimestamp, BarPrice } from 'lightweight-charts'
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

  > div.floating-tooltip {
    width: 9.6rem;
    height: 40%;
    position: absolute;
    display: none;
    box-sizing: border-box;
    font-size: 12px;
    color: '#20262E';
    background-color: rgba(255, 255, 255, 0.23);
    text-align: center;
    z-index: 1;
    top: 0px;
    left: 1.2rem;
    pointer-events: none;
    border-bottom: none;
    border-radius: 0.2rem;
    box-shadow: 0 0.2rem 0.5rem 0 rgba(117, 134, 150, 0.45);
    flex-direction: column;
    gap: 1rem;
    justify-content: end;
  }
`

const ContainerTitle = styled.span<{ captionColor?: 'green' | 'red1' | 'grey'; dateStyle?: boolean }>`
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
    margin: 0;
    padding: 0;
    gap: 1rem;
    align-items: center;

    ${({ dateStyle }): FlattenSimpleInterpolation | undefined | false =>
      dateStyle &&
      css`
        flex-direction: column;
        align-items: flex-start;
        gap: 0rem;
      `}
    > p {
      color: ${({ theme }): string => theme.white};
      font-size: large;
      font-weight: ${({ theme }): string => theme.fontBold};
      &.caption {
        font-size: 1.1rem;
        color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.grey)};
      }
      &.date {
        margin: -1rem 0;
        color: ${({ theme }): string => theme.grey};
        font-size: 1.1rem;
      }
    }
  }
`
const frameAnimation = keyframes`
    100% {
      -webkit-mask-position: left;
    }
`

type ShimmingProps = {
  shimming?: boolean
}

const ChartSkeleton = styled.div<ShimmingProps>`
  height: 100%;
  min-height: 19.6rem;
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

  ${({ shimming }): FlattenSimpleInterpolation | null =>
    shimming
      ? css`
          -webkit-mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
          background-repeat: no-repeat;
          animation: shimmer 1.5s infinite;
          animation-name: ${frameAnimation};
        `
      : null}
`

function formatChartData(data: VolumeItem[]): HistogramData[] {
  return data?.map((item) => ({
    time: item.timestamp as UTCTimestamp,
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
  const [crossHairData, setCrossHairData] = useState<HistogramData | null>(null)

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !items) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      lineWidth: 1,
    })

    series.setData(formatChartData(items))

    chart.subscribeCrosshairMove(function (param: MouseEventParams) {
      if (param === undefined || param.time === undefined || !param.point || param.point.x < 0 || param.point.y < 0) {
        setCrossHairData(null)
        return
      }

      const value = param.seriesPrices.get(series) as BarPrice
      const time = param.time
      setCrossHairData({ time, value })
    })

    setChartCreated(chart)
  }, [chartCreated, height, items, theme, width])

  // resize when window width change
  useEffect(() => {
    if (!width || !chartCreated) return

    chartCreated.resize(width, height)
    chartCreated.timeScale().scrollToPosition(0, false)
  }, [chartCreated, height, width])

  if (isLoading)
    return (
      <ChartSkeleton shimming>
        <h2>Loading...</h2>
      </ChartSkeleton>
    )

  return (
    <Wrapper ref={chartContainerRef}>
      <ContainerTitle captionColor={captionColor} dateStyle={crossHairData !== null}>
        <h3>Cow Volume</h3>
        <span>
          {crossHairData ? (
            <>
              <p>${formatSmart({ amount: crossHairData.value.toString(), precision: 0, decimals: 2 })}</p>
              <p className="date">{format(fromUnixTime(crossHairData.time as UTCTimestamp), 'MMM d, yyyy')}</p>
            </>
          ) : (
            <>
              <p>${currentVolume && formatSmart({ amount: currentVolume.toString(), precision: 0, decimals: 2 })}</p>
              <p className="caption">{diffPercentageVolume?.toFixed(2)}%</p>
            </>
          )}
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
