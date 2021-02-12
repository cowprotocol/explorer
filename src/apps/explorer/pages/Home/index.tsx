import React from 'react'
import styled from 'styled-components'
import homeTeaser from './home-teaser.png'

const Wrapper = styled.div`
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);

  text-align: center;
  img {
    max-width: 100%;
    width: 1200px;
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
