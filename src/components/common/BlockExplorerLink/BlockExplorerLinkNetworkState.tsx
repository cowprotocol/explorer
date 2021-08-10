import React from 'react'

import { useNetworkOrDefault } from 'state/network'

import { BlockExplorerLink, Props } from './BlockExplorerLink'

/**
 * BlockExplorerLink which relies on the network state
 */
export function BlockExplorerLinkNetworkState(props: Props): JSX.Element {
  // const networkId = useNetworkId() || undefined
  const networkId = useNetworkOrDefault() || undefined

  return <BlockExplorerLink {...props} networkId={networkId} />
}
