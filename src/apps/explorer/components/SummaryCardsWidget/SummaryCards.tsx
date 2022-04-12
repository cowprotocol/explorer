import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import {
  getMatchingScreenSize,
  subscribeToScreenSizeChange,
  MediumDownQueries,
  TypeMediaQueries,
} from 'utils/mediaQueries'
import { Card, CardContent } from 'components/common/Card'
import { BatchInfo, TotalSummaryResponse } from '.'

const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
`

const WrapperRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;

  > div {
    min-width: 20rem;
  }
`

const BlockCards = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 2fr;
  width: 100%;

  ${media.mediumDown} {
    grid-template-columns: 1fr 1fr;
    > div {
      min-height: 14.4rem;
    }
  }
`
const WrapperColumn = styled.div<{ flexValue?: string }>`
  display: flex;
  flex-direction: column;
  flex-basis: ${({ flexValue }): string => (flexValue ? flexValue : 'auto')};
  justify-content: center;
  align-items: center;
`
const WrapperDoubleContent = styled.div<{ column?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  flex: 1;
  gap: 3.5rem;
  min-width: 17rem;

  > div {
    text-align: center;
  }

  ${media.mediumDown} {
    gap: 2rem;
    justify-content: space-evenly;
  }
`

interface SummaryCardsProps {
  summaryData: TotalSummaryResponse
  children: React.ReactNode
}

export function cardBlock(batchInfo: BatchInfo, isLoading: boolean, valueTextSize: number): JSX.Element {
  return (
    <Card>
      <WrapperDoubleContent column>
        <CardContent
          variant="3row"
          label1="Last Batch"
          value1={batchInfo.lastBatchDate}
          loading={isLoading}
          valueSize={valueTextSize}
        />
        <CardContent
          variant="3row"
          label1="Batch ID"
          value1={batchInfo.batchId}
          loading={isLoading}
          valueSize={valueTextSize}
        />
      </WrapperDoubleContent>
    </Card>
  )
}

export function SummaryCards({ summaryData, children }: SummaryCardsProps): JSX.Element {
  const { batchInfo, dailyTransactions, totalTokens, dailyFees, isLoading } = summaryData
  const [resolution, setResolution] = useState<TypeMediaQueries>(getMatchingScreenSize())
  const isMediumAndBelowResolution = MediumDownQueries.includes(resolution)
  const valueTextSize = isMediumAndBelowResolution ? 1.65 : 1.8
  const rowsByCard = isMediumAndBelowResolution ? '3row' : '2row'
  const isDesktop = !isMediumAndBelowResolution

  useEffect(() => {
    const mediaQuery = subscribeToScreenSizeChange(() => setResolution(getMatchingScreenSize()))
    return (): void => mediaQuery()
  }, [])

  return (
    <Wrapper>
      <WrapperRow>
        <WrapperColumn flexValue={isDesktop ? '66.45%' : '100%'}>{children}</WrapperColumn>
        <WrapperColumn>{isDesktop && cardBlock(batchInfo, isLoading, valueTextSize)}</WrapperColumn>
      </WrapperRow>
      <WrapperRow>
        <BlockCards>
          {isMediumAndBelowResolution && cardBlock(batchInfo, isLoading, valueTextSize)}
          <Card>
            <CardContent
              variant={rowsByCard}
              label1="24h Transactions"
              value1={dailyTransactions.now}
              caption1={dailyTransactions.before}
              captionColor="red1"
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          <Card>
            <CardContent
              variant="2row"
              label1="Total Tokens"
              value1={totalTokens}
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          <Card>
            <CardContent
              variant={rowsByCard}
              label1="24h fees"
              value1={dailyFees.now}
              caption1={dailyFees.before}
              captionColor="green"
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          {/** Surdpuls is not yet available */}
          {/* <Card>
            <CardContent
              variant="2row"
              label1="30d Surplus"
              value1={monthSurplus.now}
              caption1={monthSurplus.before}
              captionColor="green"
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card> */}
        </BlockCards>
      </WrapperRow>
    </Wrapper>
  )
}
