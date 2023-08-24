import { CacheMixin } from 'api/proxy'
import { PRICES_CACHE_TIME } from 'const'
import { CurrentBlockAPI, CurrentBlockApiImpl } from 'api/currentblock/currentBlockchainApi'

export class CurrentBlockApiProxy extends CurrentBlockApiImpl {
  private cache: CacheMixin

  public constructor() {
    super()
    this.cache = new CacheMixin()

    this.cache.injectCache<CurrentBlockAPI>(this, [
      { method: 'getETHCurrentBlock', ttl: PRICES_CACHE_TIME },
      { method: 'getXDaiCurrentBlock', ttl: PRICES_CACHE_TIME },
    ])
  }
}
