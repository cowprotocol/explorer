import { OrderBookApi } from '@cowprotocol/cow-sdk/order-book'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/cow-sdk/subgraph'
import { MetadataApi } from '@cowprotocol/cow-sdk/metadata'

const orderBookSDKCache: Record<SupportedChainId, { prod: OrderBookApi | null; staging: OrderBookApi | null }> = {
  [SupportedChainId.MAINNET]: { prod: null, staging: null },
  [SupportedChainId.GNOSIS_CHAIN]: { prod: null, staging: null },
  [SupportedChainId.GOERLI]: { prod: null, staging: null },
}

export function orderBookSDK(chainId: SupportedChainId, env: 'prod' | 'staging' = 'prod'): OrderBookApi {
  const cached = orderBookSDKCache[chainId][env]

  if (!cached) {
    const sdk = new OrderBookApi(chainId, env)
    orderBookSDKCache[chainId][env] = sdk

    return sdk
  }

  return cached
}

const subgraphSDKCache: Record<SupportedChainId, SubgraphApi | null> = {
  [SupportedChainId.MAINNET]: null,
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.GOERLI]: null,
}

export function subgraphApiSDK(chainId: SupportedChainId): SubgraphApi {
  const cached = subgraphSDKCache[chainId]

  if (!cached) {
    const sdk = new SubgraphApi(chainId)
    subgraphSDKCache[chainId] = sdk

    return sdk
  }

  return cached
}

export const metadataApiSDK = new MetadataApi()
