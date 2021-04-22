import { domain as domainGp, signOrder as signOrderGp, Order } from '@gnosis.pm/gp-v2-contracts'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from './constants'
import { TypedDataDomain, Signer } from 'ethers'
import { Network } from 'types'

export { OrderKind } from '@gnosis.pm/gp-v2-contracts'
export type UnsignedOrder = Order

export interface SignOrderParams {
  networkId: Network
  signer: Signer
  order: UnsignedOrder
}

export interface OrderCreation extends UnsignedOrder {
  signature: string // 65 bytes encoded as hex without `0x` prefix. r + s + v from the spec
}

const TYPED_DATA_SIGNING_SCHEME = 0

function _getDomain(networkId: Network): TypedDataDomain {
  // Get settlement contract address
  const settlementContract = GP_SETTLEMENT_CONTRACT_ADDRESS[networkId]

  if (!settlementContract) {
    throw new Error('Unsupported network. Settlement contract is not deployed')
  }

  return domainGp(networkId, settlementContract) // TODO: Fix types in NPM package
}

export async function signOrder(params: SignOrderParams): Promise<string> {
  const { networkId, signer, order } = params

  const domain = _getDomain(networkId)

  console.log('[api:operator:signature] signOrder', { domain, order, signer, TYPED_DATA_SIGNING_SCHEME })

  const { data: signature } = await signOrderGp(domain, order, signer, TYPED_DATA_SIGNING_SCHEME)

  return signature.toString()
}
