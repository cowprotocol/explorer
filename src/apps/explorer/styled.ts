import styled from 'styled-components'
import { media } from 'theme/styles/media'
import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
  }
  html,
  body,
  #root {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
`

export const MainWrapper = styled.div`
  max-width: 118rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  > div {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  footer {
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 0;
  }
  header {
    margin-left: 0;
    margin-right: 0;
  }

  ${media.mediumDown} {
    max-width: 94rem;
    flex-flow: column wrap;
  }

  ${media.xSmallDown} {
    max-width: 100%;
    flex-grow: 1;
    header {
      margin-left: auto;
      margin-right: auto;
    }
    footer {
      flex-direction: column;
      flex-wrap: nowrap;
    }
  }
`
