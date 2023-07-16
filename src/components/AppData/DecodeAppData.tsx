import React, { useCallback, useEffect } from 'react'
import AppDataWrapper from 'components/common/AppDataWrapper'
import { AnyAppDataDocVersion } from '@cowprotocol/app-data'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { Notification } from 'components/Notification'
import Spinner from 'components/common/Spinner'
import { DEFAULT_IPFS_READ_URI, IPFS_INVALID_APP_IDS } from 'const'
import { getCidHashFromAppData, getDecodedAppData } from 'hooks/useAppData'
import useSafeState from 'hooks/useSafeState'

type Props = {
  appData: string
  fullAppData?: string
  showExpanded?: boolean
}

async function _getDecodedAppData(
  appData: string,
  fullAppData?: string,
): Promise<{ decodedAppData?: void | AnyAppDataDocVersion; isError: boolean }> {
  // If the full appData is available, we try to parse it as JSON
  if (fullAppData) {
    try {
      const decodedAppData = JSON.parse(fullAppData)
      return { decodedAppData, isError: false }
    } catch (error) {
      console.error('Error parsing fullAppData from the API', { fullAppData }, error)
      return { isError: true }
    }
  }

  if (IPFS_INVALID_APP_IDS.includes(appData.toString())) {
    return { isError: true }
  }

  const decodedAppData = await getDecodedAppData(appData.toString())
  return { isError: false, decodedAppData }
}

const DecodeAppData = (props: Props): JSX.Element => {
  const { appData, showExpanded = false, fullAppData } = props
  const [appDataLoading, setAppDataLoading] = useSafeState(false)
  const [appDataError, setAppDataError] = useSafeState(false)
  const [decodedAppData, setDecodedAppData] = useSafeState<AnyAppDataDocVersion | void | undefined>(undefined)
  const [ipfsUri, setIpfsUri] = useSafeState<string>('')

  const [showDecodedAppData, setShowDecodedAppData] = useSafeState<boolean>(showExpanded)

  useEffect(() => {
    const fetchIPFS = async (): Promise<void> => {
      try {
        const decodedAppDataHex = await getCidHashFromAppData(appData.toString())
        setIpfsUri(`${DEFAULT_IPFS_READ_URI}/${decodedAppDataHex}`)
      } catch {
        setAppDataError(true)
      }
    }

    fetchIPFS()
  }, [appData, setAppDataError, setIpfsUri])

  const handleDecodedAppData = useCallback(
    async (isOpen?: boolean): Promise<void> => {
      if (!isOpen) {
        setShowDecodedAppData(!showDecodedAppData)
      }
      if (decodedAppData) return

      setAppDataLoading(true)
      try {
        const { isError, decodedAppData } = await _getDecodedAppData(appData, fullAppData)
        if (isError) {
          setAppDataError(true)
        } else {
          setDecodedAppData(decodedAppData)
        }
      } catch (e) {
        setDecodedAppData(undefined)
        setAppDataError(true)
      } finally {
        setAppDataLoading(false)
      }
    },
    [
      appData,
      fullAppData,
      decodedAppData,
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
