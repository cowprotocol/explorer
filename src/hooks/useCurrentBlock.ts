import { useNetworkId } from 'state/network'
import { useEffect, useState } from 'react'
import { NATIVE_TOKEN_PER_NETWORK, XDAI } from 'const'
import { createCurrentBlockchainAPI } from 'api/currentblock'

export const useCurrentBlock = (): { isLoading: boolean; error: string; currentBlock: number | void | undefined } => {
  const network = useNetworkId() || undefined
  const [isLoading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [currentBlock, setCurrentBlock] = useState<number | void>()
  const currentBlockApi = createCurrentBlockchainAPI()

  useEffect(() => {
    async function getCurrentBlock(): Promise<void> {
      if (network) {
        setLoading(true)
        try {
          if (NATIVE_TOKEN_PER_NETWORK[network] == XDAI) {
            const response = await currentBlockApi.getXDaiCurrentBlock()
            setCurrentBlock(response.total_blocks)
          } else {
            const response = await currentBlockApi.getETHCurrentBlock()
            setCurrentBlock(response.height)
          }
        } catch (e) {
          setError(e.message)
        } finally {
          setLoading(false)
        }
      }
    }
    getCurrentBlock()
  }, [network])

  return { isLoading, error, currentBlock }
}
