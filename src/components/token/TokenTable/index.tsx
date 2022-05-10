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
import { calcDiff, getColorBySign } from 'components/common/Card/card.utils'
import { TokenDisplay } from 'components/common/TokenDisplay'

const Wrapper = styled(StyledUserDetailsTable)`
  > tbody {
    min-height: 37rem;
    > tr {
      min-height: 7.4rem;
      padding: 0 0.5rem;
      :last-child {
        border-bottom: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      }
    }
  }
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 21rem minmax(7rem, 12rem) repeat(4, minmax(10rem, 1.5fr)) repeat(1, minmax(14rem, 2fr));
  }
  > tbody > tr > td,
  > thead > tr > th {
    :nth-child(3),
    :nth-child(4),
    :nth-child(5),
    :nth-child(6) {
      justify-content: right;
    }
  }
  > tbody > tr > td:nth-child(7),
  > thead > tr > th:nth-child(7) {
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
      :nth-child(3),
      :nth-child(4),
      :nth-child(5),
      :nth-child(6),
      :nth-child(7) {
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
  align-items: center;
  a {
    display: none;
  }
  img {
    width: 2.5rem;
    height: 2.5rem;
  }
`
const StyledID = styled.span`
  margin-right: 10px;
  ${media.mobile} {
    display: none;
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
    last24hours,
    last7Days: { currentVolume, changedVolume, values },
    sevenDays,
    lastDayVolume,
  } = token
  const erc20 = { name, address, decimals } as TokenErc20
  const diffPercentageVolume = token && calcDiff(currentVolume, changedVolume)
  const captionNameColor = getColorBySign(diffPercentageVolume || 0)
  const network = useNetworkId()
  const theme = useTheme()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !token) return
    const chart = _buildChart(chartContainerRef.current, 100, 45, theme)

    const series = chart.addLineSeries({
      lineWidth: 1,
      color: theme[captionNameColor],
      lastValueVisible: false,
      priceLineVisible: false,
    })

    series.setData(values)

    chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [token, theme, chartCreated, captionNameColor, values])

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
        <HeaderValue captionColor={getColorBySign(last24hours)}>{last24hours}%</HeaderValue>
      </td>
      <td>
        <HeaderTitle>7d</HeaderTitle>
        <HeaderValue captionColor={getColorBySign(sevenDays)}>{sevenDays}%</HeaderValue>
      </td>
      <td>
        <HeaderTitle>24h volume</HeaderTitle>
        <HeaderValue>{lastDayVolume}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Last 7 days</HeaderTitle>
        <ChartWrapper ref={chartContainerRef} />
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
              No results found. <br /> Please try another search.
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
