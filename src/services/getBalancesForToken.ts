import { depositApi, erc20Api } from 'api'
import { TokenDetails, TokenBalanceDetails } from 'types'
import { ALLOWANCE_FOR_ENABLED_TOKEN } from 'const'

export async function getBalancesForToken(
  token: TokenDetails,
  userAddress: string,
  contractAddress: string,
): Promise<TokenBalanceDetails> {
  const tokenAddress = token.address
  const [
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    withdrawBatchId,
    currentBachId,
    walletBalance,
    allowance,
  ] = await Promise.all([
    depositApi.getBalance(userAddress, tokenAddress),
    depositApi.getPendingDepositAmount(userAddress, tokenAddress),
    depositApi.getPendingWithdrawAmount(userAddress, tokenAddress),
    depositApi.getPendingWithdrawBatchId(userAddress, tokenAddress),
    depositApi.getCurrentBatchId(),
    erc20Api.balanceOf(tokenAddress, userAddress),
    erc20Api.allowance(tokenAddress, userAddress, contractAddress),
  ])

  return {
    ...token,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable: withdrawingBalance.isZero() ? false : withdrawBatchId < currentBachId,
    walletBalance,
    enabled: allowance.gt(ALLOWANCE_FOR_ENABLED_TOKEN),
    highlighted: false,
    enabling: false,
    claiming: false,
  }
}
