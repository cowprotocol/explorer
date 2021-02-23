import { Theme } from 'theme'
import { logDebug } from 'utils'

export type Color = string
export interface Colors {
  // text colours
  textPrimary1: Color
  textSecondary1: Color
  textSecondary2: Color
  textActive1: Color
  textDisabled: Color

  icon: Color
  surplusPercentage: Color

  // backgrounds / greys
  bg1: Color
  bg2: Color
  bgDisabled: Color

  // gradients
  gradient1: Color
  gradient2: Color

  // labels
  labelTextOpen: Color
  labelTextExpired: Color
  labelTextFilled: Color
  labelBgOpen: Color
  labelBgExpired: Color
  labelBgFilled: Color

  // table & borders
  borderPrimary: Color
  tableRowBorder: Color

  // Base
  white: Color
  black: Color
  red1: Color
  red2: Color
  red3?: Color
  green1: Color
  green2: Color
  green3?: Color
  yellow1: Color
  yellow2: Color
  yellow3?: Color
  blue1: Color
  blue2: Color
  blue3?: Color
}

export const BASE_COLOURS = {
  // base
  white: '#FFF',
  black: '#000',
  red1: '#FF305B',
  red2: '#FF6871',
  red3: '#F82D3A',
  green1: '#00C46E',
  green2: '#09371d',
  green3: '#a9ffcd',
  yellow1: '#f1851d',
  yellow2: '#f1851d',
  blue1: '#2172E5',
  blue2: '#3F77FF',

  // labels
  labelTextExpired: '#DB843A',
  labelTextFilled: '#41C29B',
  labelBgExpired: '#DB843A1A',
  labelBgFilled: '#00D8971A',
}

export const LIGHT_COLOURS = {
  // text
  textPrimary1: '#FFF',
  textSecondary1: '#EDEDED',
  textSecondary2: '#9797B8',
  textActive1: '',
  textDisabled: '#31323E',

  icon: '#657795B3',
  surplusPercentage: '#1E9B75',

  // backgrounds / greys
  bg1: '#ffc1ff',
  bg2: '#F7F8FA',
  bgDisabled: '#ffffff80',

  // gradients
  gradient1: '#8958FF',
  gradient2: '#3F77FF',

  // labels
  labelTextOpen: '#77838F',
  labelBgOpen: '#77838F1A',

  // table & borders
  borderPrimary: 'rgba(151, 151, 184, 0.3)',
  tableRowBorder: 'rgba(151, 151, 184, 0.1)',
}

export const DARK_COLOURS = {
  // text
  textPrimary1: '#FFF',
  textSecondary1: '#EDEDED',
  textSecondary2: '#9797B8',
  textActive1: '',
  textDisabled: '#31323E',

  icon: '#8D8DA980',
  surplusPercentage: '#00D897',

  // backgrounds / greys
  bg1: '#16171F',
  bg2: '#2C2D3F',
  bgDisabled: '#ffffff80',

  // gradients
  gradient1: '#21222E',
  gradient2: '#2C2D3F',

  // labels
  labelTextOpen: '#FFFFFF',
  labelBgOpen: '#9797B84D',

  // table & borders
  borderPrimary: 'rgba(151, 151, 184, 0.3)',
  tableRowBorder: 'rgba(151, 151, 184, 0.1)',

  // TODO: add to theme, not colour palette
  // gradientForm1: 'linear-gradient(270deg, #8958FF 0%, #3F77FF 100%)',
  // gradientForm2: 'linear-gradient(270deg, #8958FF 30%, #3F77FF 100%)',
}

// UTILS
export function getThemePalette(mode: Theme): Colors {
  logDebug(`[THEME] Loading ${mode} theme colour palette`)
  let THEME_COLOURS = LIGHT_COLOURS

  switch (mode) {
    case Theme.LIGHT:
      THEME_COLOURS = LIGHT_COLOURS
      break
    case Theme.DARK:
      THEME_COLOURS = DARK_COLOURS
      break
    default:
      THEME_COLOURS = DARK_COLOURS
  }
  return {
    ...BASE_COLOURS,
    ...THEME_COLOURS,
  }
}
