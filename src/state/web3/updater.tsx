import React, { useEffect, useRef } from 'react'

import { Network } from 'types'
import useGlobalState from 'hooks/useGlobalState'
import { useWeb3 } from './hooks'
import { useNetworkId } from 'state/network-in-url'
import { ReducerActionType } from 'state/web3'
import { setWeb3 } from './actions'
import { createWeb3Api, getProviderByNetwork } from 'api/web3'
import Web3 from 'web3'

export const Web3UpdaterByUrl: React.FC = () => {
  // TODO: why not using useDispatch from https://react-redux.js.org/introduction/quick-start
  // const dispatch = useDispatch()
  const [, dispatch] = useGlobalState()
  const networkId = useNetworkId()
  const web3 = useWeb3()
  const currentNetworkId = useRef(networkId)

  useEffect(() => {
    // Update web3, when the network change
    if (currentNetworkId.current !== networkId) {
      console.log('[state:web3] Network change from ', currentNetworkId.current, 'to', networkId)
      currentNetworkId.current = networkId
      updateWeb3(networkId, web3, dispatch)
    }
  }, [currentNetworkId, networkId, dispatch, web3])

  return null
}

function updateWeb3(networkId: Network | null, web3: Web3 | null, dispatch: React.Dispatch<ReducerActionType>): void {
  let newWeb3: Web3 | null | undefined
  if (!networkId) {
    // If there's no network, we set web3 to null
    newWeb3 = null
  } else if (!web3) {
    // web3 is null, but we are in a network, then we create a new instance of web3
    const provider = getProviderByNetwork(networkId)
    if (provider) {
      newWeb3 = createWeb3Api(provider)
    }
  } else {
    // Web3 and the network are not null, update provider
    const provider = getProviderByNetwork(networkId)
    if (provider) {
      web3.setProvider(provider)
    } else {
      // Unsupported network
      newWeb3 = null
    }
  }

  // Update web3
  if (newWeb3 !== undefined) {
    dispatch(setWeb3(newWeb3))
  }
}
