import React, { useState } from 'react'
import Form from '@rjsf/core'
import { AppDataDoc, IpfsHashInfo } from '@cowprotocol/cow-sdk'
import { COW_SDK, DEFAULT_IPFS_READ_URI } from 'const'
import { useNetworkId } from 'state/network'
import { ContentCard as Content, Title } from 'apps/explorer/pages/styled'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import { AppDataWrapper } from 'components/orders/DetailsTable'
import { schema, uiSchema, validate, transformErrors } from './config'
import { Wrapper } from './styled'

const MetadataPage: React.FC = () => {
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AppDataDoc>()
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>()
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(false)

  const network = useNetworkId()
  const formRef = React.useRef<Form<any>>(null)

  const onSubmit = async ({ formData }: { formData: any }): Promise<void> => {
    if (!network) return
    setIsLoading(true)
    const res = COW_SDK[network]?.metadataApi.generateAppDataDoc(formData)
    try {
      if (!res) return
      const hashInfo = await COW_SDK[network]?.metadataApi.calculateAppDataHash(res)
      setIpfsHashInfo(hashInfo)
    } catch (e) {
      console.error(e)
    } finally {
      setAppDataDoc(res)
      setIsLoading(false)
    }
  }

  const onUploadToIPFS = async (): Promise<void> => {
    if (!network || !appDataDoc) return
    try {
      await COW_SDK[network]?.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
      setIsDocUploaded(true)
    } catch (e) {
      console.log(e)
      setIsDocUploaded(false)
    }
  }

  return (
    <Wrapper>
      <Title>Metadata Details</Title>
      <Content>
        <Form
          className="metadata-form"
          ref={formRef}
          showErrorList={false}
          formData={formData}
          validate={validate}
          transformErrors={transformErrors}
          onChange={({ formData }): void => setFormData(formData)}
          onSubmit={onSubmit}
          schema={schema}
          uiSchema={uiSchema}
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
              UPLODAD APP DATA TO IPFS
            </button>
          )}
          {isDocUploaded && (
            <RowWithCopyButton
              className="appData-hash"
              textToCopy={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cidV0}`}
              contentsToDisplay={
                <a href={`${DEFAULT_IPFS_READ_URI}/${ipfsHashInfo?.cidV0}`} target="_blank" rel="noopener noreferrer">
                  {ipfsHashInfo?.cidV0}
                </a>
              }
            />
          )}
          {isLoading && <Spinner />}
        </Form>
        <AppDataWrapper>
          <div className="hidden-content">
            <RowWithCopyButton
              textToCopy={JSON.stringify(formData, null, 2)}
              contentsToDisplay={<pre className="json-formatter">{JSON.stringify(formData, null, 2)}</pre>}
            />
          </div>
        </AppDataWrapper>
      </Content>
    </Wrapper>
  )
}

export default MetadataPage
