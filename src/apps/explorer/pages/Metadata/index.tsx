import React, { useEffect, useState } from 'react'
import Form, { FormValidation } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { AppDataDoc, IpfsHashInfo } from '@cowprotocol/cow-sdk'
import { COW_SDK, DEFAULT_IPFS_READ_URI } from 'const'
import { useNetworkId } from 'state/network'
import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import AppDataWrapper from 'components/common/AppDataWrapper'
import { Notification } from 'components/Notification'
import { INITIAL_FORM_VALUES, getSchema, validate, deletePropertyPath } from './config'
import { Wrapper } from './styled'

const MetadataPage: React.FC = () => {
  const [schema, setSchema] = useState<JSONSchema7>({})
  const [formData, setFormData] = useState(INITIAL_FORM_VALUES)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AppDataDoc>()
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>()
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const network = useNetworkId()
  const formRef = React.useRef<Form<any>>(null)

  useEffect(() => {
    const fetchSchema = async (): Promise<void> => {
      const latestSchema = await getSchema()
      setSchema(latestSchema)
    }

    fetchSchema()
  }, [])

  const handleFormatData = (formData: any): any => {
    const formattedData = structuredClone(formData)

    deletePropertyPath(formattedData, 'metadata.referrer.enableReferrer')
    deletePropertyPath(formattedData, 'metadata.quote.enableQuote')

    return formattedData
  }

  const onSubmit = async (data: any): Promise<void> => {
    const { formData, errors } = data
    if (!network || errors.length > 0) return
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
    try {
      await COW_SDK[network]?.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
      setIsDocUploaded(true)
    } catch (e) {
      setError(e.message)
      setIsDocUploaded(false)
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
          validate={(formData, errors): FormValidation => validate(formData, errors, schema)}
          omitExtraData
          showErrorList={false}
          ref={formRef}
          formData={formData}
          onChange={({ formData }: any): void => setFormData(formData)}
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
          <button type="submit" className="btn btn-info" onClick={formRef.current ? formRef.current.submit : undefined}>
            GENERATE METADATA DOC
          </button>
          {appDataDoc && (
            <button className="btn btn-info" onClick={onUploadToIPFS}>
              UPLOAD APP DATA TO IPFS
            </button>
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
