import React, { useCallback, useEffect } from 'react'
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
  showExpanded?: boolean
}

const DecodeAppData = (props: Props): JSX.Element => {
  const { appData, showExpanded = false } = props
  const [appDataLoading, setAppDataLoading] = useSafeState(false)
  const [appDataError, setAppDataError] = useSafeState(false)
  const [decodedAppData, setDecodedAppData] = useSafeState<AppDataDoc | void | undefined>(undefined)
  const [ipfsUri, setIpfsUri] = useSafeState<string>('')

  const [showDecodedAppData, setShowDecodedAppData] = useSafeState<boolean>(showExpanded)
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

  const handleDecodedAppData = useCallback(
    async (isOpen?: boolean): Promise<void> => {
      if (!isOpen) {
        setShowDecodedAppData(!showDecodedAppData)
      }
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
    },
    [
      appData,
      decodedAppData,
      network,
      setAppDataError,
      setAppDataLoading,
      setDecodedAppData,
      setShowDecodedAppData,
      showDecodedAppData,
    ],
  )

  useEffect(() => {
    if (showExpanded) {
      handleDecodedAppData(showExpanded)
    }
  }, [showExpanded, handleDecodedAppData])

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
        <a className="showMoreAnchor" onClick={(): Promise<void> => handleDecodedAppData(false)}>
          {showDecodedAppData ? '[-] Show less' : '[+] Show more'}
        </a>
      </div>
      <div className={`hidden-content ${appDataError && 'error'}`}>{renderAppData()}</div>
    </AppDataWrapper>
  )
}

export default DecodeAppData
