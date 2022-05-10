import React, { useEffect, useRef, useState } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'
import {
  createChart,
  HistogramData,
  IChartApi,
  MouseEventParams,
  UTCTimestamp,
  BarPrice,
  Coordinate,
} from 'lightweight-charts'

import { formatSmart } from 'utils'
import Spinner from 'components/common/Spinner'
import { calcDiff, getColorBySign } from 'components/common/Card/card.utils'
import {
  ChartSkeleton,
  WrapperChart,
  ContainerTitle,
  WrapperPeriodButton,
  StyledShimmerBar,
  WrapperTooltipPrice,
} from 'apps/explorer/components/SummaryCardsWidget/VolumeChart/VolumeChart.styled'
import { VolumePeriod } from './VolumeChartWidget'
import { numberFormatter } from '../utils'
import { useNetworkId } from 'state/network'

const DEFAULT_CHART_HEIGHT = 196 // px
const COLOR_POSITIVE_DIFFERENCE = 'rgba(0, 196, 110, 0.01)'
const COLOR_NEGATIVE_DIFFERENCE = 'rgba(255, 48, 91, 0.01)'
const COLOR_POSITIVE_DIFFERENCE_LINE = 'rgb(0, 196, 111)'
const COLOR_NEGATIVE_DIFFERENCE_LINE = 'rgb(255, 48, 89)'

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
        visible: true,
        style: 3,
        width: 1,
        labelVisible: false,
        color: theme.borderPrimary,
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

interface CrossHairData {
  time: UTCTimestamp
  value: BarPrice
  coordinate: Coordinate | null
}

const PriceTooltip = ({
  crossHairData,
  period,
}: {
  crossHairData: HistogramData | null
  period: VolumePeriod | undefined
}): JSX.Element | null => {
  const formattedDate = React.useMemo(() => {
    if (!crossHairData) return ''

    let _format = 'MMM d, yyyy'
    if (period === VolumePeriod.DAILY) {
      _format = 'MMM d HH:mm, yyyy'
    }

    return format(fromUnixTime(crossHairData.time as UTCTimestamp), _format)
  }, [crossHairData, period])

  if (!crossHairData) return null

  return (
    <WrapperTooltipPrice>
      <h4>${_formatAmount(crossHairData.value.toString())}</h4>
      <p className="date">{formattedDate}</p>
    </WrapperTooltipPrice>
  )
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
  const [crossHairData, setCrossHairData] = useState<CrossHairData | null>(null)
  const network = useNetworkId()
  const previousPeriod = usePreviousLastValueData(period)
  const previousNetwork = usePreviousLastValueData(network)

  // reset the chart when the volume/network period is changed
  useEffect(() => {
    if ((period !== previousPeriod || network !== previousNetwork) && chartCreated) {
      chartCreated.resize(0, 0)
      setChartCreated(null)
    }
  }, [chartCreated, period, previousPeriod, network, previousNetwork])

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !items || isLoading) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      lineWidth: 1,
      lineColor: captionNameColor === 'red1' ? COLOR_NEGATIVE_DIFFERENCE_LINE : COLOR_POSITIVE_DIFFERENCE_LINE,
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
      const time = param.time as UTCTimestamp
      const coordinate = series.priceToCoordinate(value)
      setCrossHairData({ time, value, coordinate })
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

  if (isLoading && chartCreated === undefined)
    return (
      <ChartSkeleton>
        <h2>Loading...</h2>
      </ChartSkeleton>
    )

  return (
    <>
      <WrapperChart ref={chartContainerRef}>
        <ContainerTitle captionColor={captionNameColor}>
          <h3>CoW Protocol volume</h3>
          <span>
            {isLoading ? (
              <StyledShimmerBar height={2} />
            ) : (
              <>
                <p>${currentVolume && numberFormatter(currentVolume)}</p>
                <p className="caption">
                  {(diffPercentageVolume ?? 0) > 0 ? '+' : ''}
                  {diffPercentageVolume && _formatAmount(diffPercentageVolume.toString())}%
                </p>
              </>
            )}
          </span>
          <PriceTooltip crossHairData={crossHairData} period={period} />
        </ContainerTitle>
        {children && <div className="time-selector">{children}</div>}
      </WrapperChart>
      {isLoading && <ChartSkeleton backgroundColor="orange" />}
    </>
  )
}
