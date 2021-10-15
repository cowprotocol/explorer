import React from 'react'
import styled from 'styled-components'
import { Search } from 'apps/explorer/components/common/Search'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-flow: column wrap;
  height: calc(100vh - 15rem);
  padding: 1.6rem;
  margin: 0 auto;
  width: 100%;

  > h1 {
    display: flex;
    padding: 2.4rem 0 0.75rem;
    align-items: center;
    justify-content: center;
    font-weight: ${({ theme }): string => theme.fontBold};
    width: 100%;
    margin: 0 0 2.4rem;
    font-size: 2.4rem;
    line-height: 1;
  }
`

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <h1>Search Order ID / ETH Address / ENS Address</h1>
      <Search className="home" />
    </Wrapper>
  )
}

export default Home
