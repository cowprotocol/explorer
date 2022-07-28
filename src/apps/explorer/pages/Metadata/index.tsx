import React, { useEffect, useState } from 'react'
import Form from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { AppDataDoc, IpfsHashInfo } from '@cowprotocol/cow-sdk'
import { COW_SDK, DEFAULT_IPFS_READ_URI } from 'const'
import { useNetworkId } from 'state/network'
import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import AppDataWrapper from 'components/common/AppDataWrapper'
import { Notification } from 'components/Notification'
import { INITIAL_FORM_VALUES, getSchema, transformErrors, deletePropertyPath } from './config'
import { IpfsContainer, Wrapper } from './styled'

const MetadataPage: React.FC = () => {
  const [schema, setSchema] = useState<JSONSchema7>({})
  const [formData, setFormData] = useState({})
  const [disabled, setDisabled] = useState<boolean>(true)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AppDataDoc>()
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>()
  const [ipfsCredentials, setIpfsCredentials] = useState<{ pinataApiKey?: string; pinataApiSecret?: string }>({})
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const network = useNetworkId()
  const formRef = React.useRef<Form<any>>(null)

  useEffect(() => {
    const fetchSchema = async (): Promise<void> => {
      const latestSchema = await getSchema()
      setSchema(latestSchema)
      setFormData(INITIAL_FORM_VALUES)
    }

    fetchSchema()
  }, [])

  const handleFormatData = (formData: any): any => {
    if (!formData.metadata || !Object.keys(formData.metadata).length) return formData
    const formattedData = structuredClone(formData)
    const isReferrerEnabled = formattedData.metadata.referrer.enableReferrer
    const isQuoteEnabled = formattedData.metadata.quote.enableQuote

    deletePropertyPath(formattedData, 'metadata.referrer.enableReferrer')
    deletePropertyPath(formattedData, 'metadata.quote.enableQuote')

    if (!isReferrerEnabled) {
      deletePropertyPath(formattedData, 'metadata.referrer')
    }
    if (!isQuoteEnabled) {
      deletePropertyPath(formattedData, 'metadata.quote')
    }

    return formattedData
  }

  const handleIpfsCredentials = (e: React.ChangeEvent<HTMLInputElement>, key: string): void => {
    const { value } = e.target
    setIpfsCredentials((prevState) => ({ ...prevState, [key]: value }))
  }

  const handleOnChange = ({ formData }: any): void => {
    setFormData(formData)
    setDisabled(JSON.stringify(handleFormatData(formData)) === JSON.stringify(INITIAL_FORM_VALUES))
  }

  const onSubmit = async (data: any): Promise<void> => {
    const { formData } = data
    if (!network) return
    setIsLoading(true)
    const res = COW_SDK[network]?.metadataApi.generateAppDataDoc(formData)
    try {
      if (!res) return
      const hashInfo = await COW_SDK[network]?.metadataApi.calculateAppDataHash(res)
      setIpfsHashInfo(hashInfo)
    } catch (e) {
      setError(e.message)
    } finally {
      setAppDataDoc(res)
      setIsLoading(false)
      setInvalidFormDataAttempted(false)
    }
  }

  const onUploadToIPFS = async (): Promise<void> => {
    if (!network || !appDataDoc) return
    setIsLoading(true)
    try {
      await COW_SDK[network]?.updateContext({ ipfs: ipfsCredentials })
      await COW_SDK[network]?.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
      setIsDocUploaded(true)
    } catch (e) {
      setError(e.message)
      setIsDocUploaded(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Wrapper>
      <Title>Metadata Details</Title>
      <Content>
        <Form
          className="metadata-form"
          liveOmit
          liveValidate={invalidFormDataAttempted}
          omitExtraData
          showErrorList={false}
          noHtml5Validate
          transformErrors={transformErrors}
          ref={formRef}
          autocomplete="off"
          formData={formData}
          onChange={handleOnChange}
          onSubmit={onSubmit}
          onError={(): void => setInvalidFormDataAttempted(true)}
          schema={schema}
        >
          {ipfsHashInfo && (
            <RowWithCopyButton
              className="appData-hash"
              textToCopy={ipfsHashInfo.appDataHash}
              contentsToDisplay={ipfsHashInfo.appDataHash}
            />
          )}
          <button
            type="submit"
            className="btn btn-info"
            disabled={disabled}
            onClick={formRef.current ? formRef.current.submit : undefined}
          >
            GENERATE METADATA DOC
          </button>
          {appDataDoc && (
            <>
              <IpfsContainer>
                <input
                  onChange={(e): void => handleIpfsCredentials(e, 'pinataApiKey')}
                  type="text"
                  name="apiKey"
                  placeholder="Add your Pinata API key"
                />
                <input
                  onChange={(e): void => handleIpfsCredentials(e, 'pinataApiSecret')}
                  type="text"
                  name="apiSecret"
                  placeholder="Add your Pinata API secret"
                />
                <button
                  disabled={!Object.keys(ipfsCredentials).length}
                  className="btn btn-info"
                  onClick={onUploadToIPFS}
                >
                  UPLOAD APP DATA TO IPFS
                </button>
              </IpfsContainer>
            </>
          )}
          {isDocUploaded && (
            <>
              <RowWithCopyButton
                className="appData-hash"
                textToCopy={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cidV0}`}
                contentsToDisplay={
                  <a href={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cidV0}`} target="_blank" rel="noopener noreferrer">
                    {ipfsHashInfo?.cidV0}
                  </a>
                }
              />
              <Notification
                type="success"
                message="Document uploaded successfully!"
                closable={false}
                appendMessage={false}
              />
            </>
          )}
          {isLoading && <Spinner />}
          {error && !isDocUploaded && (
            <Notification type="error" message={error} closable={false} appendMessage={false} />
          )}
        </Form>
        <AppDataWrapper>
          <div className="hidden-content">
            <RowWithCopyButton
              textToCopy={JSON.stringify(handleFormatData(formData), null, 2)}
              contentsToDisplay={
                <pre className="json-formatter">{JSON.stringify(handleFormatData(formData), null, 2)}</pre>
              }
            />
          </div>
        </AppDataWrapper>
      </Content>
    </Wrapper>
  )
}

export default MetadataPage
