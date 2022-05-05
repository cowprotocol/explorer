import { Network } from 'types'

import { getGpV1ContractAddress } from 'utils/contract'

const addressesByNetwork = {
  [Network.RINKEBY]: getGpV1ContractAddress(Network.RINKEBY),
  [Network.MAINNET]: getGpV1ContractAddress(Network.MAINNET),
  [Network.GNOSIS_CHAIN]: getGpV1ContractAddress(Network.GNOSIS_CHAIN),
}

export const getAddressForNetwork = (networkId: Network): string | null => {
  return addressesByNetwork[networkId] || null
}

export default addressesByNetwork
