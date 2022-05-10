import React from 'react'
import styled, { css } from 'styled-components'
import { media } from 'theme/styles/media'
import { formatDistanceToNowStrict } from 'date-fns'

import { Card, CardContent } from 'components/common/Card'
import { CardRow } from 'components/common/CardRow'
import { TotalSummaryResponse } from './useGetSummaryData'
import { abbreviateString } from 'utils'
import { useMediaBreakpoint } from 'hooks/useMediaBreakPoint'
import { calcDiff, getColorBySign } from 'components/common/Card/card.utils'
import { CopyButton } from 'components/common/CopyButton'
import { LinkWithPrefixNetwork } from 'components/common/LinkWithPrefixNetwork'
import { numberFormatter } from './utils'

const BatchInfoHeight = '19.6rem'
const DESKTOP_TEXT_SIZE = 1.8 // rem
const MOBILE_TEXT_SIZE = 1.65 // rem

const WrapperCardRow = styled(CardRow)`
  max-width: 70%;

  ${media.mobile} {
    max-width: 100%;
  }
`

const DoubleContentSize = css`
  min-height: ${BatchInfoHeight};
`
const WrapperColumn = styled.div`
  /* Equivalent to use lg={8} MUI grid system */
  flex-grow: 0;
  max-width: 66.666667%;
  flex-basis: 66.666667%;

  > div {
    margin: 1rem;
    max-height: ${BatchInfoHeight};
    outline: 0.1rem solid ${({ theme }): string => theme.borderPrimary};
    border-radius: 0.4rem;
    overflow: hidden;
  }

  ${media.mediumDownMd} {
    flex-grow: 0;
    max-width: 100%;
    flex-basis: 100%;
  }
`
const DoubleCardStyle = css`
  ${DoubleContentSize}

  ${media.mediumDownMd} {
    min-height: 16rem;
  }
`
const WrappedDoubleCard = styled(Card)`
  ${DoubleCardStyle}
`

const CardTransactions = styled(Card)`
  ${media.mediumDownMd} {
    ${DoubleCardStyle}
  }
`

const WrapperDoubleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;

  ${media.mediumDownMd} {
    gap: 2rem;
  }
`

interface SummaryCardsProps {
  summaryData: TotalSummaryResponse | undefined
  children: React.ReactNode
}

export function SummaryCards({ summaryData, children }: SummaryCardsProps): JSX.Element {
  const { batchInfo, dailyTransactions, totalTokens, dailyFees, isLoading } = summaryData || {}
  const isDesktop = useMediaBreakpoint(['xl', 'lg'])
  const valueTextSize = isDesktop ? DESKTOP_TEXT_SIZE : MOBILE_TEXT_SIZE
  const rowsByCard = isDesktop ? '2row' : '3row'
  const diffTransactions = (dailyTransactions && calcDiff(dailyTransactions.now, dailyTransactions.before)) || 0
  const diffFees = (dailyFees && calcDiff(dailyFees.now, dailyFees.before)) || 0

  return (
    <WrapperCardRow>
      <>
        <WrapperColumn>{children}</WrapperColumn>
        <WrappedDoubleCard xs={6} lg={4}>
          <WrapperDoubleContent>
            <CardContent
              variant="3row"
              label1="Last Batch"
              value1={batchInfo && formatDistanceToNowStrict(batchInfo.lastBatchDate, { addSuffix: true })}
              loading={isLoading}
              valueSize={valueTextSize}
            />
            <CardContent
              variant={rowsByCard}
              label1="Batch ID"
              value1={
                batchInfo && (
                  <>
                    <LinkWithPrefixNetwork to={`/tx/${batchInfo.batchId}`}>
                      {abbreviateString(batchInfo?.batchId, 6, 4)}
                    </LinkWithPrefixNetwork>
                    <CopyButton heightIcon={1.35} text={batchInfo?.batchId || ''} />
                  </>
                )
              }
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </WrapperDoubleContent>
        </WrappedDoubleCard>
        <CardTransactions xs={6} lg={4}>
          <CardContent
            variant={rowsByCard}
            label1="24h Transactions"
            value1={dailyTransactions?.now.toLocaleString()}
            caption1={`${diffTransactions.toFixed(2)}%`}
            captionColor={getColorBySign(diffTransactions)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </CardTransactions>
        <Card xs={6} lg={4}>
          <CardContent
            variant="2row"
            label1="Total Tokens"
            value1={totalTokens?.toLocaleString()}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        <Card xs={6} lg={4}>
          <CardContent
            variant={rowsByCard}
            label1="24h Fees"
            value1={`$${numberFormatter(dailyFees?.now || 0)}`}
            caption1={`${diffFees.toFixed(2)}%`}
            captionColor={getColorBySign(diffFees)}
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </Card>
        {/** Surplus is not yet available */}
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