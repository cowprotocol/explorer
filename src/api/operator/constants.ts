import { GPv2Settlement, GPv2VaultRelayer } from '@gnosis.pm/gp-v2-contracts/networks.json'
import { Network } from 'types'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<Network, string>> = {
  [Network.MAINNET]: GPv2Settlement[Network.MAINNET].address,
  [Network.RINKEBY]: GPv2Settlement[Network.RINKEBY].address,
  [Network.GNOSIS_CHAIN]: GPv2Settlement[Network.GNOSIS_CHAIN].address,
}

export const GP_VAULT_RELAYER: Partial<Record<Network, string>> = {
  [Network.MAINNET]: GPv2VaultRelayer[Network.MAINNET].address,
  [Network.RINKEBY]: GPv2VaultRelayer[Network.RINKEBY].address,
  [Network.GNOSIS_CHAIN]: GPv2VaultRelayer[Network.GNOSIS_CHAIN].address,
}

// See https://github.com/gnosis/gp-v2-contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const BUY_ETHER_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
