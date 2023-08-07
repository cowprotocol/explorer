import BigNumber from 'bignumber.js'

import { Order, RawOrder, RawSolverCompetition, RawTrade } from 'api/operator'

import { ZERO_BIG_NUMBER } from 'const'

import { USDT, WETH } from './erc20s'
import { OrderClass, OrderStatus, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'

export const RAW_ORDER = {
  creationDate: '2021-01-20T23:15:07.892538607Z',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  receiver: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  uid: '0xadef89adea9e8d7f987e98f79a87efde5f7e65df65e76d5f67e5d76f5edf',
  partiallyFillable: false,
  invalidated: false,
  signingScheme: SigningScheme.EIP712,
  class: OrderClass.MARKET,
  buyAmount: '0',
  executedBuyAmount: '0',
  sellAmount: '0',
  executedSellAmount: '0',
  feeAmount: '0',
  executedFeeAmount: '0',
  executedSurplusFee: '0',
  executedSellAmountBeforeFees: '0',
  totalFee: '0',
  sellToken: WETH.address,
  buyToken: USDT.address,
  validTo: 0,
  appData: '0',
  kind: OrderKind.SELL,
  signature:
    '0x04dca25f59e9ac744c4093530a38f1719c4e0b1ce8e4b68c8018b6b05fd4a6944e1dcf2a009df2d5932f7c034b4a24da0999f9309dd5108d51d54236b605ed991c',
  status: OrderStatus.OPEN,
} as RawOrder

export const RICH_ORDER: Order = {
  ...RAW_ORDER,
  receiver: RAW_ORDER.owner,
  shortId: 'adef89ad',
  creationDate: new Date(RAW_ORDER.creationDate),
  expirationDate: new Date(RAW_ORDER.validTo * 1000),
  buyTokenAddress: RAW_ORDER.buyToken,
  sellTokenAddress: RAW_ORDER.sellToken,
  buyAmount: new BigNumber(RAW_ORDER.buyAmount),
  sellAmount: new BigNumber(RAW_ORDER.sellAmount),
  executedBuyAmount: ZERO_BIG_NUMBER,
  executedSellAmount: ZERO_BIG_NUMBER,
  feeAmount: new BigNumber(RAW_ORDER.feeAmount),
  executedFeeAmount: new BigNumber(RAW_ORDER.executedFeeAmount),
  executedSurplusFee: ZERO_BIG_NUMBER,
  totalFee: ZERO_BIG_NUMBER,
  cancelled: RAW_ORDER.invalidated,
  status: 'open',
  partiallyFilled: false,
  fullyFilled: false,
  filledAmount: ZERO_BIG_NUMBER,
  filledPercentage: ZERO_BIG_NUMBER,
  buyToken: USDT,
  sellToken: WETH,
  surplusAmount: ZERO_BIG_NUMBER,
  surplusPercentage: ZERO_BIG_NUMBER,
}

export const RAW_TRADE: RawTrade = {
  blockNumber: 8453440,
  logIndex: 3,
  orderUid:
    '0x9754ac5510f5057c71e7da67c63edfb2258c608e26f102418e15fef6110c61595b0abe214ab7875562adee331deff0fe1912fe42608087c7',
  buyAmount: '50000000000000000',
  sellAmount: '455756789061273449606',
  sellAmountBeforeFees: '454756979170023164166',
  owner: '0x5b0abe214ab7875562adee331deff0fe1912fe42',
  buyToken: '0xc778417e063141139fce010982780140aa0cd5ab',
  sellToken: '0xd9ba894e0097f8cc2bbc9d24d308b98e36dc6d02',
  txHash: '0x2ebf2ba8c2a568af0b11d2498648d6fec01db11e81c6e4bc5dbba9237472dce9',
}

export const RAW_SOLVER_COMPETITION: RawSolverCompetition = {
  auctionStartBlock: 0,
  auctionId: 0,
  transactionHash: '0xd51f28edffcaaa76be4a22f6375ad289272c037f3cc072345676e88d92ced8b5',
  gasPrice: 0,
  liquidityCollectedBlock: 0,
  competitionSimulationBlock: 0,
  auction: {
    orders: [
      '0xff2e2e54d178997f173266817c1e9ed6fee1a1aae4b43971c53b543cffcc2969845c6f5599fbb25dbdd1b9b013daf85c03f3c63763e4bc4a',
    ],
    prices: {
      additionalProp1: '1234567890',
      additionalProp2: '1234567890',
      additionalProp3: '1234567890',
    },
  },
  solutions: [
    {
      ranking: 1,
      solver: 'string',
      solverAddress: 'string',
      objective: {
        total: 0,
        surplus: 0,
        fees: 0,
        cost: 0,
        gas: 0,
      },
      score: '1234567890',
      clearingPrices: {
        additionalProp1: '1234567890',
        additionalProp2: '1234567890',
        additionalProp3: '1234567890',
      },
      orders: [
        {
          id: '0xff2e2e54d178997f173266817c1e9ed6fee1a1aae4b43971c53b543cffcc2969845c6f5599fbb25dbdd1b9b013daf85c03f3c63763e4bc4a',
          executedAmount: '1234567890',
        },
      ],
      callData: '0xca11da7a',
      uninternalizedCallData: '0xca11da7a',
    },
  ]
}
