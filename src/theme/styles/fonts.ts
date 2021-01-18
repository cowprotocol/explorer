import { css } from 'styled-components'

import InterRegular from 'assets/fonts/Inter-Regular.woff2'
import InterBold from 'assets/fonts/Inter-Bold.woff2'
import RobotoMono from 'assets/fonts/RobotoMono-Regular.woff2'

import { Theme } from 'theme'
import { logDebug } from 'utils'

export const fontFace = css`
  @font-face {
    font-family: 'Inter';
    src: url(${InterRegular}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'Inter';
    src: url(${InterBold}) format('woff2');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Roboto Mono';
    src: url(${RobotoMono}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }
`
export interface Fonts {
  fontDefault: string
  fontArial: string
  fontSizeNormal: string
  fontSizeSmall: string
  fontSizeLarge: string
  fontSizeXLarge: string
  fontSizeXXLarge: string
  fontWeightNormal: string
  fontWeightMedium: string
  fontWeightBold: string
}

const DEFAULT_FONT = {
  fontDefault: '"Inter", "Helvetica Neue"',
  fontArial: 'Arial',
  fontSizeNormal: '1.2rem',
  fontSizeSmall: '1.1rem',
  fontSizeLarge: '1.3',
  fontSizeXLarge: '1.4rem',
  fontSizeXXLarge: '1.5rem',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
}

export function getFonts(mode: Theme): Fonts {
  logDebug(`[THEME] Loading ${mode} theme font`)
  return DEFAULT_FONT
}

export default fontFace
