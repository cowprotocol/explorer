import { Account } from 'api/tenderly'
import { SingleErc20State } from 'state/erc20'

export enum TypeNodeOnTx {
  NetworkNode = 'networkNode',
  CowProtocol = 'cowProtocol',
  Trader = 'trader',
  Dex = 'dex',
}

export type InfoTooltip = Record<string, string | SingleErc20State>

export type NodeType<T extends string, E> = { type: T; entity: E; id: string }
export type Node =
  | NodeType<TypeNodeOnTx.NetworkNode, Account>
  | NodeType<TypeNodeOnTx.CowProtocol, Account>
  | NodeType<TypeNodeOnTx.Trader, Account>
  | NodeType<TypeNodeOnTx.Dex, Account>
