import React, { useEffect, useRef, useState } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'
import { createChart, IChartApi } from 'lightweight-charts'
import BigNumber from 'bignumber.js'
import { formatPrice, TokenErc20 } from '@gnosis.pm/dex-js'

import { Token } from 'hooks/useGetTokens'
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
import { TableState } from 'apps/explorer/components/TokensTableWidget/useTable'
import { TextWithTooltip } from 'apps/explorer/components/common/TextWithTooltip'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead {
    > tr > th:first-child {
      padding: 0 2rem;
    }
  }
  > tbody {
    min-height: 37rem;
    border-bottom: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
    > tr {
      min-height: 7.4rem;
    }
    > tr > td:first-child {
      padding: 0 2rem;
    }
  }
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 4rem 21rem minmax(7rem, 12rem) repeat(6, minmax(10rem, 1.5fr));
  }
  > tbody > tr > td,
  > thead > tr > th {
    :nth-child(4),
    :nth-child(5),
    :nth-child(6),
    :nth-child(7) {
      justify-content: right;
    }
  }
  > tbody > tr > td:nth-child(8),
  > thead > tr > th:nth-child(8) {
    justify-content: center;
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
  ${media.mobile} {
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
    > tbody > tr > td,
    > thead > tr > th {
      :nth-child(4),
      :nth-child(5),
      :nth-child(6),
      :nth-child(7),
      :nth-child(8) {
        justify-content: space-between;
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
  ${media.mobile} {
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
  a {
    width: 10rem;
  }
  img {
    margin-right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }
`

const HeaderValue = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.textPrimary1)};

  ${media.mobile} {
    flex-wrap: wrap;
    text-align: end;
  }
`

const ChartWrapper = styled.div`
  position: relative;
  ${media.mobile} {
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
  tableState: TableState
}

interface RowProps {
  index: number
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

const RowToken: React.FC<RowProps> = ({ token, index }) => {
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
    totalVolumeUsd,
  } = token
  const erc20 = { name, address, decimals } as TokenErc20
  const network = useNetworkId()
  const theme = useTheme()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()

  useEffect(() => {
    if (!lastWeekUsdPrices || chartCreated || !chartContainerRef.current || !token) return
    const chart = _buildChart(chartContainerRef.current, 100, 45, theme)

    const color =
      lastWeekUsdPrices.length > 2
        ? getColorBySign((lastWeekUsdPrices[0].value - lastWeekUsdPrices[lastWeekUsdPrices.length - 1].value) * -1)
        : 'grey'
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

  const handleLoadingState = (key: unknown | null | undefined, node: JSX.Element): JSX.Element => {
    if (key === null) {
      return <span>-</span>
    }
    if (key === undefined) {
      return <ShimmerBar />
    }
    return node
  }

  if (!network) {
    return null
  }

  return (
    <tr key={id}>
      <td>
        <HeaderTitle>#</HeaderTitle>
        <HeaderValue>{index + 1}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Name</HeaderTitle>
        <TokenWrapper>
          <TokenDisplay erc20={erc20} network={network} />
        </TokenWrapper>
      </td>
      <td>
        <HeaderTitle>Symbol</HeaderTitle>
        <HeaderValue>{symbol}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip textInTooltip={`$${formatPrice({ price: new BigNumber(priceUsd) })}`}>
            ${priceUsd ? formatPrice({ price: new BigNumber(priceUsd), decimals: 4, thousands: true }) : 0}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>24h</HeaderTitle>
        {handleLoadingState(
          lastDayPricePercentageDifference,
          <HeaderValue
            captionColor={lastDayPricePercentageDifference ? getColorBySign(lastDayPricePercentageDifference) : 'grey'}
          >
            {lastDayPricePercentageDifference && lastDayPricePercentageDifference.toFixed(2)}%
          </HeaderValue>,
        )}
      </td>
      <td>
        <HeaderTitle>7d</HeaderTitle>
        {handleLoadingState(
          lastWeekPricePercentageDifference,
          <HeaderValue
            captionColor={
              lastWeekPricePercentageDifference ? getColorBySign(lastWeekPricePercentageDifference) : 'grey'
            }
          >
            {lastWeekPricePercentageDifference && lastWeekPricePercentageDifference.toFixed(2)}%
          </HeaderValue>,
        )}
      </td>
      <td>
        <HeaderTitle>24h volume</HeaderTitle>
        {handleLoadingState(
          lastDayUsdVolume,
          <HeaderValue>${lastDayUsdVolume && numberFormatter(lastDayUsdVolume)}</HeaderValue>,
        )}
      </td>
      <td>
        <HeaderTitle>Total Volume</HeaderTitle>
        <HeaderValue>
          ${totalVolumeUsd ? formatPrice({ price: new BigNumber(totalVolumeUsd), decimals: 0, thousands: true }) : 0}
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Last 7 days</HeaderTitle>
        {handleLoadingState(lastWeekUsdPrices, <ChartWrapper ref={chartContainerRef} />)}
      </td>
    </tr>
  )
}

const TokenTable: React.FC<Props> = (props) => {
  const { tokens, tableState, showBorderTable = false } = props
  const tokenItems = (items: Token[] | undefined): JSX.Element => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>
              No results found. <br /> Please try another search.
            </EmptyItemWrapper>
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          {items.map((item, i) => (
            <RowToken key={`${item.id}-${i}`} index={i + tableState.pageOffset} token={item} />
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
          <th>#</th>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price</th>
          <th>24h</th>
          <th>7d</th>
          <th>24h volume</th>
          <th>Total Volume</th>
          <th>Last 7 days</th>
        </tr>
      }
      body={tokenItems(tokens)}
    />
  )
}

export default TokenTable
