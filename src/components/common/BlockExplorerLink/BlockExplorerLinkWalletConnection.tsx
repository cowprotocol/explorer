import React from 'react'

import { useWalletConnection } from 'hooks/useWalletConnection'

import { BlockExplorerLink, Props } from './BlockExplorerLink'

/**
 * BlockExplorerLink which relies on the wallet connection
 */
export const BlockExplorerLinkWalletConnection: React.FC<Props> = (props) => {
  const { networkId: networkIdFixed } = props
  const { networkIdOrDefault: networkIdWallet } = useWalletConnection()

  const networkId = networkIdFixed || networkIdWallet

  return <BlockExplorerLink {...props} networkId={networkId} />
}
