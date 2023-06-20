import { Account } from 'api/tenderly'

export enum TypeNodeOnTx {
  NetworkNode = 'networkNode',
  CowProtocol = 'cowProtocol',
  Trader = 'trader',
  Dex = 'dex',
  Special = 'special',
  Token = 'token',
  Hyper = 'hyper',
}

export enum TypeEdgeOnTx {
  sellEdge = 'sell',
  buyEdge = 'buy',
  noKind = 'noKind',
  user = 'user',
  amm = 'amm',
}

export type InfoTooltip = Record<string, string>

export type NodeType<T extends string, E> = { type: T; entity: E; id: string }
export type Node =
  | NodeType<TypeNodeOnTx.NetworkNode, Account>
  | NodeType<TypeNodeOnTx.CowProtocol, Account>
  | NodeType<TypeNodeOnTx.Trader, Account>
  | NodeType<TypeNodeOnTx.Dex, Account>
  | NodeType<TypeNodeOnTx.Special, Account>
  | NodeType<TypeNodeOnTx.Token, Account>
  | NodeType<TypeNodeOnTx.Hyper, Account>
