import { WETH_ADDRESS_GOERLI, WETH_ADDRESS_MAINNET, WXDAI_ADDRESS_XDAI } from 'const'
import { Network } from 'types'

export interface NativeTokenInfo {
  nativeToken: string
  wrappedToken: string
}

export function getIsWrappable(networkId: number, address: string): boolean {
  switch (networkId) {
    case Network.MAINNET:
      return address === WETH_ADDRESS_MAINNET
    case Network.GOERLI:
      return address === WETH_ADDRESS_GOERLI
    case Network.GNOSIS_CHAIN:
      return address === WXDAI_ADDRESS_XDAI
    default:
      return false
  }
}

export function getNativeTokenName(networkId?: number): NativeTokenInfo {
  if (networkId === Network.GNOSIS_CHAIN) {
    return {
      nativeToken: 'xDAI',
      wrappedToken: 'wxDAI',
    }
  } else {
    return {
      nativeToken: 'ETH',
      wrappedToken: 'WETH',
    }
  }
}
