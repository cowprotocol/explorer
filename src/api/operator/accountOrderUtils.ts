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
export async function getAccountOrders(params: GetAccountOrdersParams): Promise<RawOrder[]> {
  const { networkId, owner, offset = 0, limit = 20 } = params
  const state = getState({ networkId, owner, limit })

  const currentPage = Math.round(offset / limit)
  const cachedPageOrders = state.merged.get(currentPage)

  if (cachedPageOrders) {
    return [...cachedPageOrders]
  }

  const [prodOrders, barnOrders] = await Promise.all([
    state.prodHasNext ? COW_SDK.cowApi.getOrders({ owner, offset, limit }, { chainId: networkId, env: 'prod' }) : [],
    state.barnHasNext ? COW_SDK.cowApi.getOrders({ owner, offset, limit }, { chainId: networkId, env: 'staging' }) : [],
  ])

  state.prodHasNext = prodOrders.length === limit
  if (state.prodHasNext) {
    state.prodPage += 1
  }

  state.barnHasNext = barnOrders.length === limit
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

  return [...currentPageOrders]
}

const userOrdersCache = new Map<string, CacheState>()

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
