import { depositApi, tokenListApi } from 'api'
import { getBalancesForToken } from './getBalancesForToken'
import { log } from 'utils'
import { TokenBalanceDetails } from 'types'

export async function getBalances(userAddress: string, networkId: number): Promise<TokenBalanceDetails[] | null> {
  log('[useTokenBalances] getBalances for %s in network %s', userAddress, networkId)
  if (!userAddress || !networkId) {
    return null
  }

  const contractAddress = depositApi.getContractAddress()
  const tokens = tokenListApi.getTokens(networkId)

  const balancePromises = tokens.map(async token => getBalancesForToken(token, userAddress, contractAddress))
  return Promise.all(balancePromises)
}
