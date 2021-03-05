import { useEffect } from 'react'
import { setDimensions } from 'api/analytics'
import { useNetworkId } from 'state/network'
import { getNetworkFromId } from '@gnosis.pm/dex-js'

const NETWORK_DIMENSION = 'dimension1'

export default function NetworkAnalytics(): null {
  const networkId = useNetworkId()

  // Update the GA network dimension
  useEffect(() => {
    const networkInfo = (networkId && getNetworkFromId(networkId)) || 'Not connected'
    setDimensions({
      [NETWORK_DIMENSION]: networkInfo,
    })
  }, [networkId])
  return null
}
