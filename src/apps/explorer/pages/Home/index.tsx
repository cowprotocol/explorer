import React from 'react'
import styled from 'styled-components'
import { Search } from 'apps/explorer/components/common/Search'
import { media } from 'theme/styles/media'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-flow: column wrap;
  height: calc(100vh - 15rem);
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;

  > h1 {
    text-align: center;
    padding: 2.4rem 0 0.75rem;
    font-weight: ${({ theme }): string => theme.fontBold};
    width: 100%;
    margin: 0 0 2.4rem;
    font-size: 2rem;
    line-height: 1;
  }

  ${media.mobile} {
    > h1 {
      line-height: 1.2;
      margin-bottom: 1rem;
      font-size: 1.7rem;
    }
  }
`

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <h1>Search on Gnosis&nbsp;Protocol&nbsp;Explorer</h1>
      <Search className="home" />
    </Wrapper>
  )
}

export default Home
