import { useEffect, useState } from 'react'
import { AppDataDoc } from '@cowprotocol/cow-sdk'
import { useNetworkId } from 'state/network'
import { COW_SDK } from 'const'
import { Network } from 'types'

export const useAppData = (appDataHash: string): { isLoading: boolean; appDataDoc: AppDataDoc | void | undefined } => {
  const network = useNetworkId() ?? Network.MAINNET
  const [isLoading, setLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AppDataDoc | void>()
  useEffect(() => {
    async function getAppDataDoc(): Promise<void> {
      setLoading(true)
      try {
        const decodedAppData = await COW_SDK[network]?.metadataApi.decodeAppData(appDataHash)
        setAppDataDoc(decodedAppData)
      } catch (e) {
        const msg = `Failed to fetch appData document`
        console.error(msg, e)
      } finally {
        setLoading(false)
      }
    }
    getAppDataDoc()
  }, [appDataHash, network])

  return { isLoading, appDataDoc }
}
