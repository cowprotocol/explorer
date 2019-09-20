import BN from 'bn.js'
import { fromWei } from 'web3-utils'

export function formatAmount(amount?: BN): string {
  if (!amount) {
    return ''
  }

  return fromWei(amount).toString()
}
