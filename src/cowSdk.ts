import { OrderBookApi } from '@cowprotocol/cow-sdk/order-book'
import { SubgraphApi } from '@cowprotocol/cow-sdk/subgraph'
import { MetadataApi } from '@cowprotocol/cow-sdk/metadata'

export const prodOrderBookSDK = new OrderBookApi('prod')
export const stagingOrderBookSDK = new OrderBookApi('staging')
export const subgraphApiSDK = new SubgraphApi()
export const metadataApiSDK = new MetadataApi()
