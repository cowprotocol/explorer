import React, { useEffect, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { createChart } from 'lightweight-charts'

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
}

const Wrapper = styled.div`
  border: 1px solid green;
  position: relative;
`

export function VolumeChart({ title, height = 300, width = 500 }: VolumeChartProps): JSX.Element {
  const chartContainerRef = useRef<string | HTMLElement>('')
  const [chartCreated] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    if (chartCreated) return
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        backgroundColor: 'transparent',
        textColor: theme.textPrimary1,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.2,
          bottom: 0,
        },
        borderVisible: false,
      },
      timeScale: {
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
          style: 0,
          width: 2,
          color: 'rgba(32, 38, 46, 0.1)',
          labelVisible: false,
        },
      },
    })

    chart.addAreaSeries({
      topColor: theme.orange,
      bottomColor: 'rgba(124, 224, 214, 0)',
      lineColor: theme.borderPrimary,
      lineWidth: 3,
    })
  }, [chartCreated, height, theme.borderPrimary, theme.orange, theme.textPrimary1, width])

  return (
    <Wrapper>
      {title}
      <div ref={chartContainerRef} />
    </Wrapper>
  )
}
