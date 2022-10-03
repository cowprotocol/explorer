import BN from 'bn.js'
import { TransactionReceipt } from 'web3-core'
import { PendingFlux } from 'api/deposit/DepositApi'
import { TokenOverride } from './config'
import { TokenDex } from '@gnosis.pm/dex-js'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type Command = () => void
export type AnyFunction = (...args: unknown[]) => unknown
export type Mutation<T> = (original: T) => T
export type Unpromise<T> = T extends Promise<infer U> ? U : T

export const Network = SupportedChainId
export type Network = SupportedChainId

export interface TokenDetails extends TokenDex {
  label: string
  disabled?: boolean
  override?: TokenOverride
  priority?: number
}

export interface BalanceDetails {
  exchangeBalance: BN
  pendingDeposit: PendingFlux
  pendingWithdraw: PendingFlux
  walletBalance: BN
  claimable: boolean
  enabled: boolean
  totalExchangeBalance: BN
  immatureClaim?: boolean
}

export interface TradeTokenSelection {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

export interface Market {
  baseToken: TokenDetails
  quoteToken: TokenDetails
}

export type TokenBalanceDetails = TokenDetails & BalanceDetails

export interface WithTxOptionalParams {
  txOptionalParams?: TxOptionalParams
}

export interface TxOptionalParams {
  onSentTransaction?: (transactionHash: string) => void
}

export type Receipt = TransactionReceipt

export interface Fraction {
  denominator: BN
  numerator: BN
}

export enum AnalyticsDimension {
  NETWORK,
  BROWSER_TYPE,
}

export type UiError = {
  message: string
  type: 'warn' | 'error'
}

export type Errors = Record<string, UiError>
