import React from 'react'
import styled from 'styled-components'
import homeTeaser from './home-teaser.png'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  > a {
    margin: 0 auto 20rem;
    width: 100%;
    max-width: 120rem;
  }

  > a > img {
    width: 100%;
  }
`

export const Home: React.FC = () => {
  return (
    <Wrapper>
      <a
        href="https://docs.google.com/presentation/d/1a6H06zN4m6eMFpMR4eV2gAtJxW8LB0bb/edit#slide=id.p1"
        target="blank"
      >
        <img src={homeTeaser} />
      </a>
    </Wrapper>
  )
}

export default Home
