import { useEffect, useState } from 'react'
import { AnyAppDataDocVersion } from '@cowprotocol/cow-sdk'
import { useNetworkId } from 'state/network'
import { COW_SDK } from 'const'

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
  return COW_SDK.metadataApi.decodeAppData(appDataHash)
}

export const getCidHashFromAppData = (appDataHash: string): Promise<string | void> => {
  return COW_SDK.metadataApi.appDataHexToCid(appDataHash)
}
