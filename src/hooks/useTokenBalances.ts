import { useState, useEffect, useRef } from 'react'
import { TokenBalanceDetails } from 'types'
import { useWalletConnection } from './useWalletConnection'
import { formatAmount, log } from 'utils'
import { getBalances } from 'services/getBalances'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[] | undefined
  error: boolean
  setBalances: React.Dispatch<React.SetStateAction<TokenBalanceDetails[] | null>>
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const walletInfo = useWalletConnection()
  const [balances, setBalances] = useState<TokenBalanceDetails[] | null>(null)
  const [error, setError] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    const { userAddress, networkId } = walletInfo
    getBalances(userAddress, networkId)
      .then(balances => {
        log('[useTokenBalances] Wallet balances', balances ? balances.map(b => formatAmount(b.walletBalance)) : null)
        setBalances(balances)
      })
      .catch(error => {
        console.error('Error loading balances', error)
        setError(true)
      })

    return function cleanUp(): void {
      mounted.current = false
    }
  }, [walletInfo])

  return { balances, error, setBalances }
}
