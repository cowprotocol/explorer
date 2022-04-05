import React from 'react'
import { Search } from 'apps/explorer/components/common/Search'
import { Wrapper as WrapperMod } from 'apps/explorer/pages/styled'
import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { StatsSummaryCardsWidget } from 'apps/explorer/components/SummaryCardsWidget'

const Wrapper = styled(WrapperMod)`
  max-width: 140rem;
  flex-flow: column wrap;
  justify-content: flex-start;
  display: flex;

  > h1 {
    justify-content: center;
    padding: 2.4rem 0 0.75rem;
    margin: 0 0 2.4rem;
    font-size: 2.4rem;
    line-height: 1;

    ${media.xSmallDown} {
      font-size: 1.7rem;
    }
  }
`

const SummaryWrapper = styled.section`
  display: grid;
  /* grid-template-columns: 35fr 65fr; // There will be 2 sections */
  grid-gap: 1 rem;
  padding-bottom: 5rem;
`

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <SummaryWrapper>
        <StatsSummaryCardsWidget />
      </SummaryWrapper>
      <h1>Search on CoW Protocol Explorer</h1>
      <Search className="home" />
    </Wrapper>
  )
}

export default Home
