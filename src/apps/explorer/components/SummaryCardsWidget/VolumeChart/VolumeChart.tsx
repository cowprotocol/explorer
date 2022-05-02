import React, { useEffect, useRef, useState } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'
import { createChart, HistogramData, IChartApi, MouseEventParams, UTCTimestamp, BarPrice } from 'lightweight-charts'

import { formatSmart } from 'utils'
import Spinner from 'components/common/Spinner'
import { calcDiff, getColorBySign } from 'components/common/Card/card.utils'
import {
  ChartSkeleton,
  WrapperChart,
  ContainerTitle,
  WrapperPeriodButton,
  StyledShimmerBar,
} from 'apps/explorer/components/SummaryCardsWidget/VolumeChart/VolumeChart.styled'
import { VolumePeriod } from './VolumeChartWidget'
import { numberFormatter } from '../utils'
import { useNetworkId } from 'state/network'

const DEFAULT_CHART_HEIGHT = 196 // px
const COLOR_POSITIVE_DIFFERENCE = 'rgba(0, 196, 110, 0.01)'
const COLOR_NEGATIVE_DIFFERENCE = 'rgba(255, 48, 91, 0.01)'

export interface VolumeDataResponse {
  data?: HistogramData[]
  currentVolume?: number
  changedVolume?: number
  isLoading: boolean
}

export interface VolumeChartProps {
  volumeData: VolumeDataResponse | undefined
  height?: number
  width?: number
  period?: VolumePeriod
}

export function PeriodButton({
  active,
  isLoading,
  children,
  onClick,
}: React.PropsWithChildren<{ active: boolean; isLoading: boolean | undefined; onClick: () => void }>): JSX.Element {
  return (
    <WrapperPeriodButton active={active} onClick={onClick}>
      {isLoading && active ? <Spinner spin size="1x" /> : children}
    </WrapperPeriodButton>
  )
}

function _formatAmount(amount: string): string {
  return formatSmart({ amount, precision: 0, decimals: 0 })
}

/* Store an ID to check if there is new data that
 * requires the graph to be rendered.
 *  example: <lastRecordId>-<volumePeriodSelected>
 * */
function usePreviousLastValueData<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
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
    handleScroll: false,
    handleScale: false,
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
  period,
  children,
}: React.PropsWithChildren<VolumeChartProps>): JSX.Element {
  const { data: items, currentVolume, changedVolume, isLoading } = volumeData || {}
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()
  const theme = useTheme()
  const diffPercentageVolume = currentVolume && changedVolume && calcDiff(currentVolume, changedVolume)
  const captionNameColor = getColorBySign(diffPercentageVolume || 0)
  const [crossHairData, setCrossHairData] = useState<HistogramData | null>(null)
  const network = useNetworkId()
  const previousPeriod = usePreviousLastValueData(period)
  const previousNetwork = usePreviousLastValueData(network)

  // reset the chart when the volume period is changed
  useEffect(() => {
    if ((period !== previousPeriod || network !== previousNetwork) && chartCreated) {
      chartCreated.resize(0, 0)
      setChartCreated(null)
    }
  }, [chartCreated, period, previousPeriod, network])

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !items || isLoading) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      lineWidth: 1,
      lineColor: theme[captionNameColor],
      topColor: theme[captionNameColor],
      bottomColor: captionNameColor === 'red1' ? COLOR_NEGATIVE_DIFFERENCE : COLOR_POSITIVE_DIFFERENCE,
    })

    series.setData(items)

    chart.subscribeCrosshairMove(function (param: MouseEventParams) {
      if (param === undefined || param.time === undefined || !param.point || param.point.x < 0 || param.point.y < 0) {
        setCrossHairData(null)
        return
      }

      const value = param.seriesPrices.get(series) as BarPrice
      const time = param.time
      setCrossHairData({ time, value })
    })

    chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [captionNameColor, chartCreated, height, isLoading, items, theme, width])

  // resize when window width change
  useEffect(() => {
    if (!width || !chartCreated) return

    chartCreated.resize(width, height)
    chartCreated.timeScale().scrollToPosition(0, false)
  }, [chartCreated, height, width])

  const formattedDate = React.useMemo(() => {
    if (!crossHairData) return ''

    if (period === VolumePeriod.DAILY) {
      return format(fromUnixTime(crossHairData.time as UTCTimestamp), 'MMM d HH:mm, yyyy')
    }

    return format(fromUnixTime(crossHairData.time as UTCTimestamp), 'MMM d, yyyy')
  }, [crossHairData, period])

  if (isLoading && chartCreated === undefined)
    return (
      <ChartSkeleton>
        <h2>Loading...</h2>
      </ChartSkeleton>
    )

  return (
    <>
      <WrapperChart ref={chartContainerRef}>
        <ContainerTitle captionColor={captionNameColor} dateStyle={crossHairData !== null}>
          <h3>CoW Protocol volume</h3>
          <span>
            {isLoading ? (
              <StyledShimmerBar height={2} />
            ) : crossHairData ? (
              <>
                <p>${_formatAmount(crossHairData.value.toString())}</p>
                <p className="date">{formattedDate}</p>
              </>
            ) : (
              <>
                <p>${currentVolume && numberFormatter(currentVolume)}</p>
                {Number.isNaN(diffPercentageVolume) ? (
                  ''
                ) : (
                  <p className="caption">
                    {(diffPercentageVolume ?? 0) > 0 ? '+' : ''}
                    {diffPercentageVolume && _formatAmount(diffPercentageVolume.toString())}%
                  </p>
                )}
              </>
            )}
          </span>
        </ContainerTitle>
        {children && <div className="time-selector">{children}</div>}
      </WrapperChart>
      {isLoading && <ChartSkeleton backgroundColor="orange" />}
    </>
  )
}
