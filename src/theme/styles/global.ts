import { createGlobalStyle, css } from 'styled-components'

import { web3ModalOverride } from './overrides'

// TODO: remove for constants from colour palette later
import variables from 'components/layout/GenericLayout/variablesCss'
import fontFace from './fonts'

const selection = css`
  /* CSS for selecting text */
  *::selection {
    background: #218dff; /* WebKit/Blink Browsers */
  }
  *::-moz-selection {
    background: #218dff; /* Gecko Browsers */
  }
  *::-webkit-selection {
    background: #218dff; /* Chrome Browsers */
  }
  /* End CSS for selecting text */
`

const scrollbars = css`
  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
  ::-webkit-scrollbar-track {
    background: hsla(0, 0%, 100%, 0.1);
  }
`

export const StaticGlobalStyle = createGlobalStyle`
  /* TEMPORARY: import variables */ 
  ${variables}
  
  /* Fonts */
  ${fontFace}

  /* Selection CSS */
  ${selection}

  /* Scrollbars CSS */
  ${scrollbars}

  .noScroll {
    overflow: hidden;
  }

  .not-implemented {
    display: none !important
  }

  html, body {  
    height: 100vh;
    width: 100vw;
    margin: 0;
    font-size: 62.5%;
    text-rendering: geometricPrecision;
    line-height: 10px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
    overscroll-behavior-y: none;
    scroll-behavior: smooth;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  /* TODO: move closer to H elements or sth */
  h1, h2, h3 {
    margin: 0;
    margin: 0.5rem 0;
  }
  h1 {
    font-size: 3rem;
  }
  h2 {
    font-size: 2rem;
  }
  
  /* Overrides CSS - see overrides.ts file */
  ${web3ModalOverride}  
`

export const ThemedGlobalStyle = createGlobalStyle`
  html, body {
    background: ${({ theme }): string => theme.bg1};
    color: ${({ theme }): string => theme.textPrimary1};
    /* StyleLint fights you for the Helvetica, sans-serif as it requires a fallback and can't detect it from the theme prop */
    font-family: ${({ theme }): string => theme.fontDefault}, Helvetica, sans-serif;
  }

  /* TODO: move closer to <a> element */
  a {   
    text-decoration: underline;
    cursor: pointer;
      &:link, 
      &:visited {
        color: ${({ theme }): string => theme.textActive1};
      }
  }
`
