import { OrderMetaData, SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW_SDK } from 'const'

import { GetAccountOrdersParams, RawOrder } from './types'

/**
 * Gets a list of orders of one user paginated
 *
 * Optional filters:
 *  - owner: address
 *  - offset: int
 *  - limit: int
 */
export async function getAccountOrders(params: GetAccountOrdersParams): Promise<GetAccountOrdersResponse> {
  const { networkId, owner, offset = 0, limit = 20 } = params
  const state = getState({ networkId, owner, limit })
  const limitPlusOne = limit + 1

  const currentPage = Math.round(offset / limit)
  const cachedPageOrders = state.merged.get(currentPage)

  if (cachedPageOrders) {
    return {
      orders: [...cachedPageOrders],
      hasNextPage: Boolean(state.merged.get(currentPage + 1)) || state.unmerged.length > 0,
    }
  }

  const [prodOrders, barnOrders] = await Promise.all([
    state.prodHasNext
      ? COW_SDK.cowApi.getOrders({ owner, offset, limit: limitPlusOne }, { chainId: networkId, env: 'prod' })
      : [],
    state.barnHasNext
      ? COW_SDK.cowApi.getOrders({ owner, offset, limit: limitPlusOne }, { chainId: networkId, env: 'staging' })
      : [],
  ])

  state.prodHasNext = prodOrders.length === limitPlusOne
  if (state.prodHasNext) {
    state.prodPage += 1
  }

  state.barnHasNext = barnOrders.length === limitPlusOne
  if (state.barnHasNext) {
    state.barnPage += 1
  }

  const mergedEnvs = [...prodOrders, ...barnOrders, ...state.unmerged]
    .filter((v, i, a) => a.findIndex((v2) => v2.uid === v.uid) === i) // remove duplicated orders
    .sort((o1, o2) => new Date(o2.creationDate).getTime() - new Date(o1.creationDate).getTime())

  const currentPageOrders = mergedEnvs.slice(0, limit)
  state.merged.set(currentPage, currentPageOrders)

  if (mergedEnvs.length > limit) {
    state.unmerged = mergedEnvs.slice(limit)
  } else {
    state.unmerged = []
  }

  return { orders: [...currentPageOrders], hasNextPage: state.unmerged.length > 0 }
}

const userOrdersCache = new Map<string, CacheState>()

export type GetAccountOrdersResponse = {
  orders: RawOrder[]
  hasNextPage: boolean
}

type CacheKey = {
  networkId: SupportedChainId
  owner: string
  limit: number
}

type CacheState = {
  merged: Map<number, OrderMetaData[]>
  unmerged: OrderMetaData[]
  prodPage: number
  prodHasNext: boolean
  barnPage: number
  barnHasNext: boolean
}

const emptyState = (): CacheState => ({
  merged: new Map<number, OrderMetaData[]>(),
  unmerged: [] as OrderMetaData[],
  prodPage: 0,
  prodHasNext: true,
  barnPage: 0,
  barnHasNext: true,
})

const getState = (cacheKey: CacheKey): CacheState => {
  const key = JSON.stringify(cacheKey)
  const cachedState = userOrdersCache.get(key)

  if (!cachedState) {
    userOrdersCache.set(key, emptyState())
    console.debug('User Orders: Cache reset', { key })
  }

  return userOrdersCache.get(key) ?? emptyState()
}
