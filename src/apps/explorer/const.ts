import { AnalyticsDimension, Network } from 'types'

/** Explorer app constants */
export const ORDER_QUERY_INTERVAL = 10000 // in ms
export const ORDERS_QUERY_INTERVAL = 30000 // in ms
export const ORDERS_HISTORY_MINUTES_AGO = 10 // in minutes
export const PENDING_ORDERS_BUFFER = 60 * 1000 //60s in ms

export const DISPLAY_TEXT_COPIED_CHECK = 1000 // in ms

// formatSmart related constants
export const LOW_PRECISION_DECIMALS = 2 // display stuff with up to 2 digits: 123.432452 => 123.43
export const MIDDLE_PRECISION_DECIMALS = 4 // display stuff with up to 4 digits: 0.8319079051029 => 0.8319
export const HIGH_PRECISION_DECIMALS = 8 // display stuff with up to 8 digits: 0.8319079051029 => 0.83190790
export const HIGH_PRECISION_SMALL_LIMIT = '0.00000001' // what is considered too small. See https://github.com/gnosis/dex-js/blob/master/src/utils/format.ts#L78-L80
export const PERCENTAGE_PRECISION = -2 // assumes 100% === 1; 1/10^-2 => 100
export const NO_ADJUSTMENT_NEEDED_PRECISION = 0 // 1.4 => 1.4

// Analytics
export const DIMENSION_NAMES = {
  [AnalyticsDimension.NETWORK]: 'dimension1',
  [AnalyticsDimension.BROWSER_TYPE]: 'dimension2',
}

export const NETWORK_ID_SEARCH_LIST = [Network.MAINNET, Network.GNOSIS_CHAIN, Network.RINKEBY, Network.GOERLI]

// Estimation heigh of the header + footer space
export const HEIGHT_HEADER_FOOTER = 257

export const TOKEN_SYMBOL_UNKNOWN = 'UNKNOWN'
