import React from 'react'
import { Search } from 'apps/explorer/components/common/Search'
import { Wrapper as WrapperMod } from 'apps/explorer/pages/styled'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

const Wrapper = styled(WrapperMod)`
  max-width: 140rem;
  flex-flow: column wrap;
  justify-content: center;
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

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <h1>Search on CoW Protocol Explorer</h1>
      <Search className="home" />
    </Wrapper>
  )
}

export default Home
