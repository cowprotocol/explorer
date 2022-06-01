import { GetOrderParams, GetTxOrdersParams, RawOrder } from 'api/operator'
import { NETWORK_ID_SEARCH_LIST } from 'apps/explorer/const'
import { Network } from 'types'
import { OrderMetaData } from '@cowprotocol/cow-sdk'

export type SingleOrder = RawOrder | OrderMetaData | null
export type MultipleOrders = RawOrder[] | OrderMetaData[] | null

export interface GetOrderResult<R> {
  order: R | null
  errorOrderPresentInNetworkId?: Network
}

type GetOrderParamsApi<T> = {
  [K in keyof T]: T[K]
}

interface GetOrderApiFn<T, R> {
  (params: GetOrderParamsApi<T>): Promise<R>
}

export type GetOrderApi<T, R> = {
  api: GetOrderApiFn<T, R>
  defaultParams: GetOrderParamsApi<T>
}

type TypeOrderApiParams = GetOrderParams | GetTxOrdersParams

export async function tryGetOrderOnAllNetworksAndEnvironments<TypeOrderResult>(
  networkId: Network,
  getOrderApi: GetOrderApi<TypeOrderApiParams, TypeOrderResult>,
  networkIdSearchListRemaining: Network[] = NETWORK_ID_SEARCH_LIST,
): Promise<GetOrderResult<TypeOrderResult>> {
  // Get order
  const order = await getOrderApi.api({ ...getOrderApi.defaultParams, networkId })

  if (order || networkIdSearchListRemaining.length === 0) {
    // We found the order in the right network
    // ...or we have no more networks in which to continue looking
    // so we return the "order" (can be null if it wasn't found in any network)
    return { order }
  }

  // If we didn't find the order in the current network, we look in different networks
  const [nextNetworkId, ...remainingNetworkIds] = networkIdSearchListRemaining.filter((network) => network != networkId)

  // Try to get the oder in another network (to see if the ID is OK, but the network not)
  const isOrderInDifferentNetwork = await getOrderApi
    .api({ ...getOrderApi.defaultParams, networkId: nextNetworkId })
    .then((_order) => _order !== null)

  if (isOrderInDifferentNetwork) {
    // If the order exist in the other network
    return {
      order: null,
      errorOrderPresentInNetworkId: nextNetworkId,
    }
  } else {
    // Keep looking in other networks
    return tryGetOrderOnAllNetworksAndEnvironments(nextNetworkId, getOrderApi, remainingNetworkIds)
  }
}
