import React, { useEffect } from 'react'
import AppDataWrapper from 'components/common/AppDataWrapper'
import { AppDataDoc } from '@cowprotocol/cow-sdk'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { Notification } from 'components/Notification'
import Spinner from 'components/common/Spinner'
import { DEFAULT_IPFS_READ_URI, IPFS_INVALID_APP_IDS } from 'const'
import { getCidHashFromAppData, getDecodedAppData } from 'hooks/useAppData'
import useSafeState from 'hooks/useSafeState'
import { useNetworkId } from 'state/network'

type Props = {
  appData: number
}

const DecodeAppData = (props: Props): JSX.Element => {
  const { appData } = props
  const [appDataLoading, setAppDataLoading] = useSafeState(false)
  const [appDataError, setAppDataError] = useSafeState(false)
  const [decodedAppData, setDecodedAppData] = useSafeState<AppDataDoc | void | undefined>(undefined)
  const [ipfsUri, setIpfsUri] = useSafeState<string>('')

  const [showDecodedAppData, setShowDecodedAppData] = useSafeState<boolean>(false)
  const network = useNetworkId()

  useEffect(() => {
    const fetchIPFS = async (): Promise<void> => {
      try {
        const decodedAppDataHex = await getCidHashFromAppData(appData.toString(), network || undefined)
        setIpfsUri(`${DEFAULT_IPFS_READ_URI}/${decodedAppDataHex}`)
      } catch {
        setAppDataError(true)
      }
    }

    fetchIPFS()
  }, [appData, network, setAppDataError, setIpfsUri])

  const handleDecodedAppData = async (): Promise<void> => {
    setShowDecodedAppData(!showDecodedAppData)
    if (decodedAppData) return
    if (IPFS_INVALID_APP_IDS.includes(appData.toString())) {
      setAppDataError(true)
      return
    }
    setAppDataLoading(true)
    try {
      const decodedAppData = await getDecodedAppData(appData.toString(), network || undefined)
      setDecodedAppData(decodedAppData)
    } catch (e) {
      setDecodedAppData(undefined)
      setAppDataError(true)
    } finally {
      setAppDataLoading(false)
    }
  }

  const renderAppData = (): JSX.Element | null => {
    if (appDataLoading) return <Spinner />
    if (showDecodedAppData) {
      if (appDataError)
        return (
          <Notification
            type="error"
            message="Error when getting metadata info."
            closable={false}
            appendMessage={false}
          />
        )
      return (
        <RowWithCopyButton
          textToCopy={JSON.stringify(decodedAppData, null, 2)}
          contentsToDisplay={<pre className="json-formatter">{JSON.stringify(decodedAppData, null, 2)}</pre>}
        />
      )
    }
    return null
  }

  return (
    <AppDataWrapper>
      <div className="data-container">
        {appDataError ? (
          <span className="app-data">{appData}</span>
        ) : (
          <RowWithCopyButton
            textToCopy={ipfsUri}
            contentsToDisplay={
              <a href={ipfsUri} target="_blank" rel="noopener noreferrer">
                {appData}
              </a>
            }
          />
        )}
        <a className="showMoreAnchor" onClick={handleDecodedAppData}>
          {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
        </a>
      </div>
      <div className="hidden-content">{renderAppData()}</div>
    </AppDataWrapper>
  )
}

export default DecodeAppData
