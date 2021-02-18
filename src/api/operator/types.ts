import { Network } from 'types'

export type OrderID = string

export interface OrderPostError {
  errorType: 'MissingOrderData' | 'InvalidSignature' | 'DuplicateOrder' | 'InsufficientFunds'
  description: string
}

export interface FeeInformation {
  expirationDate: string
  minimalFee: string
  feeRatio: number
}

export type OrderKind = 'sell' | 'buy'

export type OrderStatus = 'open' | 'filled' | 'expired' | 'partially filled'

// Raw API response
export type RawOrder = {
  creationDate: string
  owner: string
  uid: string
  executedBuyAmount: string
  executedSellAmount: string
  executedFeeAmount: string
  invalidated: boolean
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: number
  feeAmount: string
  kind: OrderKind
  partiallyFillable: boolean
  signature: string
}

type WithNetworkId = { networkId: Network }

export type GetOrderParams = WithNetworkId & {
  orderId: string
}

export type GetOrdersParams = WithNetworkId & {
  owner?: string
  sellToken?: string
  buyToken?: string
}
