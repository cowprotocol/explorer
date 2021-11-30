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
    font-size: 2.4rem;
    line-height: 1;
  }

  ${media.mobile} {
    > h1 {
      text-align: left;
      font-size: 1.8rem;
      color: ${({ theme }): string => theme.textSecondary2};
      font-weight: ${({ theme }): string => theme.fontMedium};
      line-height: 1.2;
      margin: 0 0 1rem;
      span {
        color: ${({ theme }): string => theme.textPrimary1};
        font-size: 3.2rem;
        display: block;
        margin-bottom: 1rem;
        font-weight: ${({ theme }): string => theme.fontBold};
      }
    }
  }
`

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <h1>
        <span>Search</span> Order ID / ETH Address / ENS Address
      </h1>
      <Search className="home" />
    </Wrapper>
  )
}

export default Home
