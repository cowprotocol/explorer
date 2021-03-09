import React, { useEffect } from 'react'
import { Redirect, useLocation } from 'react-router-dom'

import { Network } from 'types'
import useGlobalState from 'hooks/useGlobalState'

import { setNetwork } from './actions'
import { useNetworkId } from './hooks'
import { updateWeb3Provider } from 'api/web3'
import { web3 } from 'apps/explorer/api'

function getNetworkId(network: string | undefined): Network {
  switch (network) {
    case 'rinkeby':
      return Network.Rinkeby
    case 'xdai':
      return Network.xDAI
    default:
      return Network.Mainnet
  }
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
