import React, { useEffect, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'

import { createChart, HistogramData, IChartApi } from 'lightweight-charts'

interface VolumeData {
  id: string
  timestamp: number
  volumeUsd: number
}

export interface VolumeChartProps {
  title: string
  data: VolumeData[]
  height: number
  width: number
  type?: TYPE_CHART_SERIES
}

const Wrapper = styled.div`
  border: 1px solid red;
  position: relative;

  > .volumechart {
    color: red;
  }
`

enum TYPE_CHART_SERIES {
  HISTOGRAM,
  AREA,
}

function formatChartData(data: VolumeData[]): HistogramData[] {
  return data?.map((item) => ({
    time: format(fromUnixTime(item.timestamp), 'yyyy-MM-dd'),
    value: item.volumeUsd,
  }))
}

export function VolumeChart({
  title,
  data,
  height = 200,
  width = 500,
  type = TYPE_CHART_SERIES.AREA,
}: VolumeChartProps): JSX.Element {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null>(null)
  const theme = useTheme()

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
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

    const series =
      type === TYPE_CHART_SERIES.AREA
        ? chart.addAreaSeries({
            topColor: theme.orange,
            lineWidth: 1,
            scaleMargins: {
              top: 0.32,
              bottom: 0,
            },
          })
        : chart.addHistogramSeries({
            baseLineColor: theme.orange,
            baseLineWidth: 3,
          })

    series.setData(formatChartData(data))
    const toolTip = document.createElement('div')
    toolTip.className = 'volumechart'
    chartContainerRef.current.appendChild(toolTip)
    toolTip.style.display = 'block'
    toolTip.style.fontWeight = '500'
    toolTip.style.position = 'absolute'
    toolTip.style.zIndex = '10'
    toolTip.style.padding = '8px'
    toolTip.style.width = '100%'

    function setLastBarText(): void {
      toolTip.innerHTML = `<div style="font-size: 16px; margin: 4px 0px; color: ${theme.white};">${title}</div>`
    }
    setLastBarText()

    setChartCreated(chart)
  }, [
    chartCreated,
    data,
    height,
    theme.borderPrimary,
    theme.orange,
    theme.textPrimary1,
    theme.white,
    title,
    type,
    width,
  ])

  return (
    <Wrapper>
      <div ref={chartContainerRef} />
    </Wrapper>
  )
}
