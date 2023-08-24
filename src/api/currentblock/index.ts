import { CurrentBlockAPI } from 'api/currentblock/currentBlockchainApi'
import { CurrentBlockApiProxy } from 'api/currentblock/currentBlockApiProxy'

export function createCurrentBlockchainAPI(): CurrentBlockAPI {
  const CurrentBlockApi: CurrentBlockAPI = new CurrentBlockApiProxy()
  window['CurrentBlockAPI'] = CurrentBlockApi
  return CurrentBlockApi
}
