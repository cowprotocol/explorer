import BigNumber from 'bignumber.js'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { OrderMetaData, TradeMetaData } from '@gnosis.pm/cow-sdk'

import { Network } from 'types'

export type OrderID = string
export type TxHash = string

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

export type OrderStatus = 'open' | 'filled' | 'cancelled' | 'cancelling' | 'expired' | 'signing'
export type RawOrderStatusFromAPI = 'presignaturePending' | 'open' | 'fullfilled' | 'cancelled' | 'expired'

// Raw API response
export type RawOrder =
  | {
      creationDate: string
      owner: string
      receiver?: string
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
      status: RawOrderStatusFromAPI
    }
  | OrderMetaData

/**
 * Enriched Order type.
 * Applies some transformations on the raw api data.
 * Some fields are kept as is.
 */
export type Order = Pick<RawOrder, 'owner' | 'uid' | 'appData' | 'kind' | 'partiallyFillable' | 'signature'> & {
  receiver: string
  txHash?: string
  shortId: string
  creationDate: Date
  expirationDate: Date
  buyTokenAddress: string
  buyToken?: TokenErc20 | null // undefined when not set, null when not found
  sellTokenAddress: string
  sellToken?: TokenErc20 | null
  buyAmount: BigNumber
  sellAmount: BigNumber
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
  feeAmount: BigNumber
  executedFeeAmount: BigNumber
  cancelled: boolean
  status: OrderStatus
  partiallyFilled: boolean
  fullyFilled: boolean
  filledAmount: BigNumber
  filledPercentage: BigNumber
  surplusAmount: BigNumber
  surplusPercentage: BigNumber
}

/**
 * Raw API trade response type
 */
export type RawTrade =
  | {
      blockNumber: number
      logIndex: number
      owner: string
      txHash: string
      orderUid: string
      buyAmount: string
      sellAmount: string
      sellAmountBeforeFees: string
      buyToken: string
      sellToken: string
      executionTime: string
    }
  | TradeMetaData

/**
 * Enriched Trade type
 */
export type Trade = Pick<RawTrade, 'blockNumber' | 'logIndex' | 'owner' | 'txHash'> & {
  orderId: string
  kind?: OrderKind
  buyAmount: BigNumber
  executedBuyAmount?: BigNumber
  sellAmount: BigNumber
  executedSellAmount?: BigNumber
  executedFeeAmount?: BigNumber
  sellAmountBeforeFees: BigNumber
  buyToken?: TokenErc20 | null
  buyTokenAddress: string
  sellToken?: TokenErc20 | null
  sellTokenAddress: string
  executionTime: Date
  surplusAmount?: BigNumber
  surplusPercentage?: BigNumber
}

export type WithNetworkId = { networkId: Network }

export type GetOrderParams = WithNetworkId & {
  orderId: string
}

export type GetAccountOrdersParams = WithNetworkId & {
  owner: string
  offset?: number
  limit?: number
}

export type GetOrdersParams = WithNetworkId & {
  owner: string
  minValidTo: number
  sellToken?: string
  buyToken?: string
}

export type GetTxOrdersParams = WithNetworkId & {
  txHash: TxHash
}

export type GetTradesParams = WithNetworkId & {
  owner?: string
  orderId?: string
}
