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
import {
  INITIAL_FORM_VALUES,
  getSchema,
  transformErrors,
  deletePropertyPath,
  ipfsSchema,
  uiSchema,
  CustomField,
} from './config'
import { IpfsWrapper, Wrapper } from './styled'
import { ExternalLink } from 'components/analytics/ExternalLink'

type FormProps = Record<string, any>

const MetadataPage: React.FC = () => {
  const [schema, setSchema] = useState<JSONSchema7>({})
  const [formData, setFormData] = useState({})

  const [disabled, setDisabled] = useState<string>(JSON.stringify({ metadata: true, ipfs: true }))
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<{ metadata: boolean; ipfs: boolean }>({
    metadata: false,
    ipfs: false,
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [appDataDoc, setAppDataDoc] = useState<AppDataDoc>()
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>()
  const [ipfsCredentials, setIpfsCredentials] = useState<{ pinataApiKey?: string; pinataApiSecret?: string }>({})
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const network = useNetworkId()
  const formRef = React.useRef<Form<FormProps>>(null)
  const ipfsFormRef = React.useRef<Form<FormProps>>(null)

  const toggleDisable = (data: { [key: string]: boolean }): void => {
    const disable = { ...JSON.parse(disabled), ...data }
    setDisabled(JSON.stringify(disable))
  }

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

  const handleErrors = (_: FormProps, errors: FormValidation, form: string): FormValidation => {
    const ref = form === 'metadata' ? formRef : ipfsFormRef
    if (!ref.current) return errors
    const { errors: formErrors } = ref.current?.state as FormProps
    toggleDisable({ [form]: formErrors.length > 0 })
    return errors
  }

  const handleOnChange = ({ formData }: FormProps): void => {
    setFormData(formData)
    if (JSON.stringify(handleFormatData(formData)) !== JSON.stringify(INITIAL_FORM_VALUES)) {
      toggleDisable({ metadata: false })
    }
  }

  const onSubmit = async (data: FormProps): Promise<void> => {
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
      setInvalidFormDataAttempted((prevState) => ({ ...prevState, metadata: true }))
    }
  }

  const handleIPFSOnChange = ({ formData }: FormProps): void => {
    setIpfsCredentials(formData)
    if (JSON.stringify(formData) !== JSON.stringify({})) {
      toggleDisable({ ipfs: false })
    }
  }

  const onUploadToIPFS = async (data: FormProps): Promise<void> => {
    const { formData } = data
    if (!network || !appDataDoc) return
    setIsLoading(true)
    try {
      await COW_SDK[network]?.updateContext({ ipfs: formData })
      await COW_SDK[network]?.metadataApi.uploadMetadataDocToIpfs(appDataDoc)
      setIsDocUploaded(true)
    } catch (e) {
      setError(e.message)
      setIsDocUploaded(false)
    } finally {
      setIsLoading(false)
      setInvalidFormDataAttempted((prevState) => ({ ...prevState, ipfs: true }))
    }
  }

  return (
    <Wrapper>
      <Title>App Data Details</Title>
      <Content>
        <div className="form-container">
          <Form
            className="data-form"
            liveOmit
            liveValidate={invalidFormDataAttempted.metadata}
            omitExtraData
            showErrorList={false}
            fields={{ cField: CustomField }}
            noHtml5Validate
            onChange={handleOnChange}
            formData={formData}
            validate={(formData: FormProps, errors: FormValidation): FormValidation =>
              handleErrors(formData, errors, 'metadata')
            }
            transformErrors={transformErrors}
            ref={formRef}
            autoComplete="off"
            onSubmit={onSubmit}
            onError={(): void => setInvalidFormDataAttempted((prevState) => ({ ...prevState, metadata: true }))}
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
            <button
              type="submit"
              className="btn btn-info"
              disabled={JSON.parse(disabled).metadata}
              onClick={formRef.current ? formRef.current.submit : undefined}
            >
              GENERATE METADATA DOC
            </button>
          </Form>
          <AppDataWrapper>
            <div className="hidden-content">
              <p>AppData Root Schema information can be found in:</p>
              <ExternalLink
                target={'_blank'}
                rel="noopener noreferrer"
                href={`https://docs.cow.fi/front-end/creating-app-ids`}
              >
                {' '}
                AppData documentation
              </ExternalLink>{' '}
              |
              <ExternalLink
                target={'_blank'}
                rel="noopener noreferrer"
                href={`https://docs.cow.fi/front-end/creating-app-ids/create-the-order-meta-data-file/metadata`}
              >
                {' '}
                Metadata documentation
              </ExternalLink>
              <RowWithCopyButton
                textToCopy={JSON.stringify(handleFormatData(formData), null, 2)}
                contentsToDisplay={
                  <pre className="json-formatter">{JSON.stringify(handleFormatData(formData), null, 2)}</pre>
                }
              />
            </div>
          </AppDataWrapper>
        </div>
        <div className="ipfs-container">
          {appDataDoc && (
            <>
              <IpfsWrapper>
                <Form
                  showErrorList={false}
                  onSubmit={onUploadToIPFS}
                  liveValidate={invalidFormDataAttempted.ipfs}
                  className="data-form"
                  onChange={handleIPFSOnChange}
                  formData={ipfsCredentials}
                  fields={{ cField: CustomField }}
                  ref={ipfsFormRef}
                  noHtml5Validate
                  validate={(formData: FormProps, errors: FormValidation): FormValidation =>
                    handleErrors(formData, errors, 'ipfs')
                  }
                  onError={(): void => setInvalidFormDataAttempted((prevState) => ({ ...prevState, ipfs: true }))}
                  transformErrors={transformErrors}
                  schema={ipfsSchema}
                  uiSchema={uiSchema}
                >
                  <button
                    className="btn btn-info"
                    type="submit"
                    disabled={JSON.parse(disabled).ipfs}
                    onClick={ipfsFormRef.current ? ipfsFormRef.current.submit : undefined}
                  >
                    UPLOAD APP DATA TO IPFS
                  </button>
                </Form>
              </IpfsWrapper>
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
        </div>
      </Content>
    </Wrapper>
  )
}

export default MetadataPage
