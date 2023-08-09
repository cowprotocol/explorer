import { TransactionReceipt } from 'web3-core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type None<T> = { [K in keyof T]?: never }
export type EitherOrBoth<T1, T2> = (T1 & None<T2>) | (T2 & None<T1>) | (T1 & T2)
export type Command = () => void
export type AnyFunction = (...args: unknown[]) => unknown
export type Mutation<T> = (original: T) => T
export type Unpromise<T> = T extends Promise<infer U> ? U : T

export const Network = SupportedChainId
export type Network = SupportedChainId

export interface TxOptionalParams {
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt

export enum AnalyticsDimension {
  NETWORK,
  BROWSER_TYPE,
}

export type UiError = {
  message: string
  type: 'warn' | 'error'
}

export type Errors = Record<string, UiError>
