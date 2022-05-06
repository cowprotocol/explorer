import React, { useEffect, useRef, useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'
import { createChart, IChartApi } from 'lightweight-charts'
import BigNumber from 'bignumber.js'
import { formatPrice, TokenErc20 } from '@gnosis.pm/dex-js'

import { Token } from 'api/operator'
import { useNetworkId } from 'state/network'

import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

import { media } from 'theme/styles/media'
import { getColorBySign } from 'components/common/Card/card.utils'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { numberFormatter } from 'apps/explorer/components/SummaryCardsWidget/utils'
import ShimmerBar from 'apps/explorer/components/common/ShimmerBar'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 21rem 14rem repeat(2, minmax(10rem, 1.5fr)) repeat(2, minmax(18rem, 2fr)) 1fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  ${media.desktopMediumDown} {
    > thead > tr {
      display: none;
    }
    > tbody > tr {
      grid-template-columns: none;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 16px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }
    }
    tr > td {
      display: flex;
      flex: 1;
      width: 100%;
      justify-content: space-between;
      margin: 0;
      margin-bottom: 18px;
      min-height: 32px;
      span.span-inside-tooltip {
        align-items: flex-end;
        flex-direction: column;
        img {
          margin-left: 0;
        }
      }
    }
    .header-value {
      flex-wrap: wrap;
      text-align: end;
    }
    .span-copybtn-wrap {
      display: flex;
      flex-wrap: nowrap;
      span {
        display: flex;
        align-items: center;
      }
      .copy-text {
        display: none;
      }
    }
  }
  overflow: auto;
`

const HeaderTitle = styled.span`
  display: none;
  ${media.desktopMediumDown} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`

const TokenWrapper = styled.div`
  display: flex;
  align-items: center;
  a {
    display: none;
  }
  img {
    width: 2.5rem;
    height: auto;
  }
`
const StyledID = styled.span`
  margin-right: 10px;
  ${media.desktopMediumDown} {
    display: none;
  }
`
const HeaderValue = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.textPrimary1)};

  ${media.desktopMediumDown} {
    flex-wrap: wrap;
    text-align: end;
  }
`

const ChartWrapper = styled.div`
  position: relative;
  ${media.desktopMediumDown} {
    table > tr > td:first-child {
      display: none;
    }
    table > tr > td {
      left: 10px;
    }
  }
`

export type Props = StyledUserDetailsTableProps & {
  tokens: Token[] | undefined
}

interface RowProps {
  token: Token
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
        labelVisible: false,
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

const RowToken: React.FC<RowProps> = ({ token }) => {
  const {
    id,
    name,
    symbol,
    address,
    decimals,
    priceUsd,
    lastDayPricePercentageDifference,
    lastWeekUsdPrices,
    lastWeekPricePercentageDifference,
    lastDayUsdVolume,
  } = token
  const erc20 = { name, address, decimals } as TokenErc20
  const network = useNetworkId()
  const theme = useTheme()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()

  useEffect(() => {
    if (!lastWeekUsdPrices || chartCreated || !chartContainerRef.current || !token) return
    const chart = _buildChart(chartContainerRef.current, 100, 45, theme)
    const color = getColorBySign(
      (lastWeekUsdPrices[0].value - lastWeekUsdPrices[lastWeekUsdPrices.length - 1].value) * -1,
    )
    const series = chart.addLineSeries({
      lineWidth: 1,
      color: theme[color],
      lastValueVisible: false,
      priceLineVisible: false,
    })

    series.setData(lastWeekUsdPrices)

    chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [token, theme, chartCreated, lastWeekUsdPrices])

  if (!network) {
    return null
  }

  return (
    <tr key={id}>
      <td>
        <StyledID>{id}</StyledID>
        <HeaderTitle>Name</HeaderTitle>
        <TokenWrapper>
          <TokenDisplay erc20={erc20} network={network} />
          <HeaderValue>{name}</HeaderValue>
        </TokenWrapper>
      </td>
      <td>
        <HeaderTitle>Symbol</HeaderTitle>
        <HeaderValue>{symbol}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price</HeaderTitle>
        <HeaderValue> ${formatPrice({ price: new BigNumber(priceUsd), decimals: 2 })}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>24h</HeaderTitle>
        {lastDayPricePercentageDifference ? (
          <HeaderValue captionColor={getColorBySign(lastDayPricePercentageDifference)}>
            {lastDayPricePercentageDifference}%
          </HeaderValue>
        ) : (
          <ShimmerBar />
        )}
      </td>
      <td>
        <HeaderTitle>7d</HeaderTitle>
        {lastWeekPricePercentageDifference ? (
          <HeaderValue captionColor={getColorBySign(lastWeekPricePercentageDifference)}>
            {lastWeekPricePercentageDifference}%
          </HeaderValue>
        ) : (
          <ShimmerBar />
        )}
      </td>
      <td>
        <HeaderTitle>24h volume</HeaderTitle>
        {lastDayUsdVolume ? <HeaderValue>${numberFormatter(lastDayUsdVolume)}</HeaderValue> : <ShimmerBar />}
      </td>
      <td>
        <HeaderTitle>Last 7 days</HeaderTitle>
        {lastWeekUsdPrices ? <ChartWrapper ref={chartContainerRef} /> : <ShimmerBar />}
      </td>
    </tr>
  )
}

const TokenTable: React.FC<Props> = (props) => {
  const { tokens, showBorderTable = false } = props

  const tokenItems = (items: Token[] | undefined): JSX.Element => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>
              Can&apos;t load details <br /> Please try again
            </EmptyItemWrapper>
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          {items.map((item, i) => (
            <RowToken key={`${item.id}-${i}`} token={item} />
          ))}
        </>
      )
    }
    return tableContent
  }

  return (
    <Wrapper
      showBorderTable={showBorderTable}
      header={
        <tr>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price</th>
          <th>24h</th>
          <th>7d</th>
          <th>24h volume</th>
          <th>Last 7 days</th>
        </tr>
      }
      body={tokenItems(tokens)}
    />
  )
}

export default TokenTable
