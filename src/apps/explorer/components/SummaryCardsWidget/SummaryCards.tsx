import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { Card, CardContent } from 'components/common/Card'
import { TotalSummaryResponse } from '.'

const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
`

const WrapperRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;

  ${media.mediumDown} {
    flex-flow: column wrap;
  }
`
const WrapperRow2 = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;

  ${media.mediumDown} {
    /* to improve and use 3 columns */
    div {
      min-width: 28%;
      padding: 0;
    }
  }
`
const WrapperColumn = styled.div<{ flexValue?: string }>`
  display: flex;
  flex-direction: column;
  flex-basis: ${({ flexValue }): string => (flexValue ? flexValue : 'auto')};
`
const WrapperDoubleContent = styled.div<{ column?: boolean }>`
  display: flex;
  flex-direction: ${({ column }): string => (column ? 'column' : 'row')};
  justify-content: stretch;
  align-items: stretch;
  flex: 1;
  gap: 3.5rem;

  > div {
    text-align: center;
  }

  ${media.mediumDown} {
    flex-direction: row;
    justify-content: space-evenly;
  }
`

interface SummaryCardsProps {
  summaryData: TotalSummaryResponse
  children: React.ReactNode
}

export function SummaryCards({ summaryData, children }: SummaryCardsProps): JSX.Element {
  const { batchInfo, dailyTransactions, totalTokens, dailyFees, isLoading } = summaryData

  return (
    <Wrapper>
      <WrapperRow>
        <WrapperColumn flexValue={'66%'}>{children}</WrapperColumn>
        <WrapperColumn>
          <Card>
            <WrapperDoubleContent column>
              <CardContent variant="3row" label1="Last Batch" value1={batchInfo.lastBatchDate} loading={isLoading} />
              <CardContent variant="3row" label1="Batch ID" value1={batchInfo.batchId} loading={isLoading} />
            </WrapperDoubleContent>
          </Card>
        </WrapperColumn>
      </WrapperRow>
      <WrapperRow2>
        <Card>
          <CardContent
            variant="2row"
            label1="24h Transactions"
            value1={dailyTransactions.now}
            caption1={dailyTransactions.before}
            captionColor="red1"
            loading={isLoading}
          />
        </Card>
        <Card>
          <CardContent variant="2row" label1="Total Tokens" value1={totalTokens} loading={isLoading} />
        </Card>
        <Card>
          <CardContent
            variant="2row"
            label1="24h fees"
            value1={dailyFees.now}
            caption1={dailyFees.before}
            captionColor="green"
            loading={isLoading}
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
            />
          </Card> */}
      </WrapperRow2>
    </Wrapper>
  )
}
