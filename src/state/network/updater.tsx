import React, { useEffect } from 'react'
import { Redirect, useLocation } from 'react-router-dom'

import { Network } from 'types'
import useGlobalState from 'hooks/useGlobalState'

import { setNetwork } from './actions'
import { useNetworkId } from './hooks'
import { updateWeb3Provider } from 'api/web3'
import { web3 } from 'apps/explorer/api'

const MAINNET_PREFIX = ''
const NETWORK_PREFIXES_RAW: [Network, string][] = [
  [Network.Mainnet, ''],
  [Network.xDAI, 'xdai'],
  [Network.Rinkeby, 'rinkeby'],
]
const PREFIX_BY_NETWORK_ID: Map<Network, string> = new Map(NETWORK_PREFIXES_RAW)
const NETWORK_ID_BY_PREFIX: Map<string, Network> = new Map(NETWORK_PREFIXES_RAW.map(([key, value]) => [value, key]))

function getNetworkId(network = MAINNET_PREFIX): Network {
  const networkId = NETWORK_ID_BY_PREFIX.get(network)
  return networkId || Network.Mainnet
}

function getNetworkPrefix(network: Network): string {
  const prefix = PREFIX_BY_NETWORK_ID.get(network)
  return prefix || MAINNET_PREFIX
}

/** Redirects to the canonnical URL for mainnet */
export const RedirectToNetwork = (props: { networkId: Network }): JSX.Element | null => {
  const { networkId } = props
  const { pathname } = useLocation()
  const prefix = getNetworkPrefix(networkId)

  const pathMatchArray = pathname.match('/(rinkeby|xdai|mainnet)?/?(.*)')
  if (pathMatchArray == null) {
    return null
  }

  const prefixPath = prefix ? `/${prefix}` : ''
  const newPath = prefixPath + '/' + pathMatchArray[2]

  return <Redirect push={false} to={newPath} />
}

/** Redirects to the canonnical URL for mainnet */
export const RedirectMainnet = (): JSX.Element => {
  const { pathname } = useLocation()

  const pathMatchArray = pathname.match('/mainnet(.*)')
  const newPath = pathMatchArray && pathMatchArray.length > 0 ? pathMatchArray[1] : '/'

  return <Redirect push={false} to={newPath} />
}

export const NetworkUpdater: React.FC = () => {
  // TODO: why not using useDispatch from https://react-redux.js.org/introduction/quick-start
  // const dispatch = useDispatch()
  const [, dispatch] = useGlobalState()
  const currentNetworkId = useNetworkId()
  const location = useLocation()

  useEffect(() => {
    const networkMatchArray = location.pathname.match('^/(rinkeby|xdai)')
    const network = networkMatchArray && networkMatchArray.length > 0 ? networkMatchArray[1] : undefined
    const networkId = getNetworkId(network)

    // Update the network if it's different
    if (currentNetworkId !== networkId) {
      dispatch(setNetwork(networkId))
      updateWeb3Provider(web3, networkId)
    }
  }, [location, currentNetworkId, dispatch])

  return null
}
