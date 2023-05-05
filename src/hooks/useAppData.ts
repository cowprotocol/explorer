import { useEffect, useState } from 'react'
import { AnyAppDataDocVersion } from '@cowprotocol/app-data'
import { useNetworkId } from 'state/network'
import { metadataApiSDK } from 'cowSdk'
import { DEFAULT_IPFS_READ_URI } from 'const'

export const useAppData = (
  appDataHash: string,
): { isLoading: boolean; appDataDoc: AnyAppDataDocVersion | void | undefined } => {
  const network = useNetworkId() || undefined
  const [isLoading, setLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AnyAppDataDocVersion | void>()
  useEffect(() => {
    async function getAppDataDoc(): Promise<void> {
      setLoading(true)
      try {
        const decodedAppData = await getDecodedAppData(appDataHash)
        setAppDataDoc(decodedAppData)
      } catch (e) {
        const msg = `Failed to fetch appData document`
        console.error(msg, e)
      } finally {
        setLoading(false)
        setAppDataDoc(undefined)
      }
    }
    getAppDataDoc()
  }, [appDataHash, network])

  return { isLoading, appDataDoc }
}

export const getDecodedAppData = (appDataHash: string): Promise<void | AnyAppDataDocVersion> => {
  return metadataApiSDK.decodeAppData(appDataHash, DEFAULT_IPFS_READ_URI)
}

export const getCidHashFromAppData = (appDataHash: string): Promise<string | void> => {
  return metadataApiSDK.appDataHexToCid(appDataHash)
}
