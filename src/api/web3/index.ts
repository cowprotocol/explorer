import Web3 from 'web3'
import { getNetworkFromId } from '@gnosis.pm/dex-js'

import { Network } from 'types'

import { ETH_NODE_URL, INFURA_ID } from 'const'

// TODO connect to mainnet if we need AUTOCONNECT at all
export const getDefaultProvider = (): string | null => (process.env.NODE_ENV === 'test' ? null : ETH_NODE_URL)

const web3cache = {}

export function createWeb3Api(provider?: string): Web3 {
  const _provider = provider || getDefaultProvider() || ''

  if (web3cache[_provider]) {
    return web3cache[_provider]
  }
  // TODO: Create an `EthereumApi` https://github.com/gnosis/gp-v1-ui/issues/331
  const web3 = new Web3(_provider)
  // `handleRevert = true` makes `require` failures to throw
  // For more details see https://github.com/gnosis/gp-v1-ui/issues/511
  web3.eth['handleRevert'] = true

  if (process.env.MOCK_WEB3 === 'true') {
    // Only function that needs to be mocked so far. We can add more and add extra logic as needed
    web3.eth.getCode = async (address: string): Promise<string> => address
  }

  web3cache[_provider] = web3
  return web3
}

function infuraProvider(networkId: Network): string {
  // INFURA_ID relies on mesa `config` file logic.
  // We can be independent of that config by relying on the env var directly
  if (!INFURA_ID) {
    throw new Error(`INFURA_ID not set`)
  }
  return `wss://${getNetworkFromId(networkId).toLowerCase()}.infura.io/ws/v3/${INFURA_ID}`
}

// For now only infura provider is available
export function getProviderByNetwork(networkId: Network | null): string | undefined {
  switch (networkId) {
    case Network.Mainnet:
    case Network.Rinkeby:
    case Network.xDAI:
      return infuraProvider(networkId)
    default:
      return undefined
  }
}

// Approach 2: update the provider in a single web3 instance
// Advantage is that regular APIs that require web3 instance should work without any changes
// Also, there's no change to consumers currently importing from <app>/api module
// Side effect is applied at reducer level (state/network/updater module)
export function updateWeb3Provider(web3: Web3, networkId?: Network | null): void {
  if (!networkId) {
    return
  }

  const provider = getProviderByNetwork(networkId)

  provider && web3.setProvider(provider)
}
