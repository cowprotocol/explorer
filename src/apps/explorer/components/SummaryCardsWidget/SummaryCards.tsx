import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

import { Card, CardContent } from 'components/common/Card'
import { TotalSummaryResponse } from '.'

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 0.7fr 2.35fr;
  grid-template-areas: 'one two';

  > div:first-child {
    justify-content: flex-end;
  }
`

const WrapperDoubleContent = styled.div<{ column?: boolean }>`
  display: flex;
  flex-direction: ${({ column }): string => (column ? 'column' : 'row')};
  justify-content: flex-start;
  flex: 1;
  gap: 3.5rem;

  > div {
    text-align: center;
  }

  ${media.mediumDown} {
    flex-direction: column;
  }
`
const CardRow = styled.div`
  grid-area: one;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
`
const WrapperTwo = styled.div`
  grid-area: two;
  display: flex;
  flex: 1;
`

export function SummaryCards({ summaryData }: { summaryData: TotalSummaryResponse }): JSX.Element {
  const { batchInfo, dailyTransactions, totalTokens, dailyFees, isLoading } = summaryData

  return (
    <Wrapper>
      <CardRow>
        <Card>
          <WrapperDoubleContent column>
            <CardContent variant="3row" label1="Last Batch" value1={batchInfo.lastBatchDate} loading={isLoading} />
            <CardContent variant="3row" label1="Batch ID" value1={batchInfo.batchId} loading={isLoading} />
          </WrapperDoubleContent>
        </Card>
      </CardRow>
      <WrapperTwo>
        <CardRow>
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
        </CardRow>
      </WrapperTwo>
    </Wrapper>
  )
}
