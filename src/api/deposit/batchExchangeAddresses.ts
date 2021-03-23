import { Network } from 'types'

import { getGpV1ContractAddress } from 'utils/contract'

const addressesByNetwork = {
  [Network.Rinkeby]: getGpV1ContractAddress(Network.Rinkeby),
  [Network.Mainnet]: getGpV1ContractAddress(Network.Mainnet),
  [Network.xDAI]: getGpV1ContractAddress(Network.xDAI),
}

export const getAddressForNetwork = (networkId: Network): string | null => {
  return addressesByNetwork[networkId] || null
}

export default addressesByNetwork
