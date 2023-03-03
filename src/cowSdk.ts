import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { SubgraphApi } from '@cowprotocol/cow-sdk'
import { MetadataApi } from '@cowprotocol/cow-sdk'

export const prodOrderBookSDK = new OrderBookApi({ env: 'prod' })
export const stagingOrderBookSDK = new OrderBookApi({ env: 'staging' })
export const subgraphApiSDK = new SubgraphApi()
export const metadataApiSDK = new MetadataApi()
