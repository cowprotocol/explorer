import React, { useEffect, useRef, useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'

import { createChart, HistogramData, IChartApi, MouseEventParams } from 'lightweight-charts'
import { formatSmart } from 'utils'

const DEFAULT_CHART_HEIGHT = 196 // px

interface VolumeData {
  id: string
  timestamp: number
  volumeUsd: number
}

export interface VolumeChartProps {
  title: string
  data: VolumeData[]
  currentVolume: string
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

const ContainerTitle = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  margin: 0px;
  > h3 {
    color: ${({ theme }): string => theme.grey};
    font-size: initial;
    font-weight: ${({ theme }): string => theme.fontMedium};
  }

  > p {
    color: ${({ theme }): string => theme.white};
    font-size: large;
    font-weight: ${({ theme }): string => theme.fontBold};
  }
`

function formatChartData(data: VolumeData[]): HistogramData[] {
  return data?.map((item) => ({
    time: format(fromUnixTime(item.timestamp), 'yyyy-MM-dd'),
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
      visible: false,
    },
    timeScale: {
      visible: false,
      borderVisible: false,
    },
    grid: {
      horzLines: {
        color: 'rgba(197, 203, 206, 0.5)',
        visible: false,
      },
      vertLines: {
        color: 'rgba(197, 203, 206, 0.5)',
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: false,
        labelVisible: false,
      },
      vertLine: {
        visible: true,
        style: 3,
        width: 1,
        color: theme.borderPrimary,
        labelVisible: false,
      },
    },
  })
}

export function VolumeChart({
  data,
  currentVolume,
  height = DEFAULT_CHART_HEIGHT,
  width = undefined,
}: VolumeChartProps): JSX.Element {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null>(null)
  const theme = useTheme()

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      topColor: theme.orange,
      lineWidth: 1,
      scaleMargins: {
        top: 0.32,
        bottom: 0,
      },
    })

    series.setData(formatChartData(data))
    const toolTip = document.createElement('div')
    toolTip.setAttribute('class', 'floating-tooltip')
    chartContainerRef.current.appendChild(toolTip)

    chart.subscribeCrosshairMove(function (param: MouseEventParams) {
      if (param === undefined || param.time === undefined) return

      const price = 1234
      const time = format(1650459653147, 'yyyy-MM-dd')

      toolTip.innerHTML = `<div>` + price + `<span>` + time + +'</span>' + '</div>'
    })

    chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [chartCreated, data, height, theme, theme.borderPrimary, theme.orange, theme.textPrimary1, theme.white, width])

  return (
    <Wrapper ref={chartContainerRef}>
      <ContainerTitle>
        <h3>Cow Volume</h3>
        <p>${formatSmart(currentVolume, 0)}</p>
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
