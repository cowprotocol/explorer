import React from 'react'
import styled from 'styled-components'
import { media } from 'theme/styles/media'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  > a {
    margin: 0 auto 20rem;
    width: 100%;
    max-width: 140rem;
    padding: 0 1.6rem;

    ${media.mediumDown} {
      max-width: 94rem;
    }

    ${media.mobile} {
      max-width: 100%;
    }
  }

  > a > img {
    width: 100%;
  }
`

export const Home: React.FC = () => {
  return <Wrapper>Hello</Wrapper>
}

export default Home