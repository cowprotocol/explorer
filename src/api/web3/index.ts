import Web3 from 'web3'

import { ETH_NODE_URL } from 'const'

// TODO connect to mainnet if we need AUTOCONNECT at all
export const getDefaultProvider = (): string | null => (process.env.NODE_ENV === 'test' ? null : ETH_NODE_URL)

export function createWeb3Api(): Web3 {
  // TODO: Create an `EthereumApi` https://github.com/gnosis/gp-v1-ui/issues/331
  const web3 = new Web3(getDefaultProvider())
  // `handleRevert = true` makes `require` failures to throw
  // For more details see https://github.com/gnosis/gp-v1-ui/issues/511
  web3.eth['handleRevert'] = true

  if (process.env.MOCK_WEB3 === 'true') {
    // Only function that needs to be mocked so far. We can add more and add extra logic as needed
    web3.eth.getCode = async (address: string): Promise<string> => address
  }
  return web3
}
