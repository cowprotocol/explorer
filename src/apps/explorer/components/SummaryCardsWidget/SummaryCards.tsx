import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import { media } from 'theme/styles/media'

import {
  getMatchingScreenSize,
  subscribeToScreenSizeChange,
  MediumDownQueries,
  TypeMediaQueries,
} from 'utils/mediaQueries'
import { Card, CardContent } from 'components/common/Card'
import { CardRow } from 'components/common/CardRow'
import { TotalSummaryResponse } from '.'

const WrapperCardRow = styled(CardRow)`
  max-width: 70%;

  ${media.mobile} {
    max-width: 100%;
  }
`

const DoubleContentSize = css`
  min-height: 19.6rem;
`
const WrapperTransactionsCard = styled(Card)`
  ${media.mediumDownMd} {
    ${DoubleContentSize}
  }
`
const WrapperColumn = styled.div`
  ${DoubleContentSize}
  /* Equivalent to use lg={8} MUI grid system */
  flex-grow: 0;
  max-width: 66.666667%;
  flex-basis: 66.666667%;
  padding-right: 2rem;

  ${media.mediumDownMd} {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
`
const WrappedDoubleCard = styled(Card)`
  ${DoubleContentSize}
`

const WrapperDoubleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`

interface SummaryCardsProps {
  summaryData: TotalSummaryResponse
  children: React.ReactNode
}

export function SummaryCards({ summaryData, children }: SummaryCardsProps): JSX.Element {
  const { batchInfo, dailyTransactions, totalTokens, dailyFees, isLoading } = summaryData
  const [resolution, setResolution] = useState<TypeMediaQueries>(getMatchingScreenSize())
  const isMediumAndBelowResolution = MediumDownQueries.includes(resolution)
  const isDesktop = !isMediumAndBelowResolution
  const valueTextSize = isDesktop ? 1.8 : 1.65
  const rowsByCard = isDesktop ? '2row' : '3row'

  useEffect(() => {
    const mediaQuery = subscribeToScreenSizeChange(() => setResolution(getMatchingScreenSize()))
    return (): void => mediaQuery()
  }, [])

  return (
    <WrapperCardRow>
      <>
        <WrapperColumn>{children}</WrapperColumn>
        <WrappedDoubleCard xs={6} lg={4}>
          <WrapperDoubleContent>
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
        </WrappedDoubleCard>
        <WrapperTransactionsCard xs={6} lg={4}>
          <CardContent
            variant={rowsByCard}
            label1="24h Transactions"
            value1={dailyTransactions.now}
            caption1={dailyTransactions.before}
            captionColor="red1"
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </WrapperTransactionsCard>
        <Card xs={6} lg={4}>
          <CardContent
            variant="2row"
            label1="Total Tokens"
            value1={totalTokens}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        <Card xs={6} lg={4}>
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
      </>
    </WrapperCardRow>
  )
}
