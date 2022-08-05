import React, { useEffect, useState } from 'react'
import Form, { FormValidation } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { IpfsHashInfo } from '@cowprotocol/cow-sdk'
import { COW_SDK, DEFAULT_IPFS_READ_URI } from 'const'
import { useNetworkId } from 'state/network'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import Spinner from 'components/common/Spinner'
import AppDataWrapper from 'components/common/AppDataWrapper'
import { Notification } from 'components/Notification'
import {
  INITIAL_FORM_VALUES,
  INVALID_IPFS_CREDENTIALS,
  getSchema,
  transformErrors,
  handleErrors,
  deletePropertyPath,
  ipfsSchema,
  uiSchema,
  ipfsUiSchema,
  CustomField,
  FormProps,
} from './config'
import { IpfsWrapper } from './styled'
import { ExternalLink } from 'components/analytics/ExternalLink'

const FormPage: React.FC = () => {
  const [schema, setSchema] = useState<JSONSchema7>({})
  const [appDataForm, setAppDataForm] = useState({})
  const [disabledAppData, setDisabledAppData] = useState<boolean>(true)
  const [disabledIPFS, setDisabledIPFS] = useState<boolean>(true)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<{ appData: boolean; ipfs: boolean }>({
    appData: false,
    ipfs: false,
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [ipfsHashInfo, setIpfsHashInfo] = useState<IpfsHashInfo | void | undefined>()
  const [ipfsCredentials, setIpfsCredentials] = useState<{ pinataApiKey?: string; pinataApiSecret?: string }>({})
  const [isDocUploaded, setIsDocUploaded] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const network = useNetworkId()
  const formRef = React.useRef<Form<FormProps>>(null)
  const ipfsFormRef = React.useRef<Form<FormProps>>(null)

  useEffect(() => {
    const fetchSchema = async (): Promise<void> => {
      const latestSchema = await getSchema()
      setSchema(latestSchema)
      setAppDataForm(INITIAL_FORM_VALUES)
    }

    fetchSchema()
  }, [])

  const toggleInvalid = (data: { [key: string]: boolean }): void => {
    setInvalidFormDataAttempted((prevState) => ({ ...prevState, ...data }))
  }

  const resetFormFields = (form: string): void => {
    setDisabledIPFS(true)
    setIpfsCredentials({})
    toggleInvalid({ ipfs: false })
    if (form === 'appData') {
      setDisabledAppData(true)
    }
  }

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

  const handleMetadataErrors = (_: FormProps, errors: FormValidation): FormValidation =>
    handleErrors(formRef, errors, setDisabledAppData)

  const handleIPFSErrors = (_: FormProps, errors: FormValidation): FormValidation =>
    handleErrors(ipfsFormRef, errors, setDisabledIPFS)

  const handleOnChange = ({ formData }: FormProps): void => {
    setAppDataForm(formData)
    if (ipfsHashInfo) {
      setIpfsHashInfo(undefined)
      setIsDocUploaded(false)
      resetFormFields('appData')
      setError(undefined)
    }
    if (JSON.stringify(handleFormatData(formData)) !== JSON.stringify(INITIAL_FORM_VALUES)) {
      setDisabledAppData(false)
    }
  }

  const onSubmit = async ({ formData }: FormProps): Promise<void> => {
    if (!network) return
    setIsLoading(true)
    try {
      const hashInfo = await COW_SDK[network]?.metadataApi.calculateAppDataHash(handleFormatData(formData))
      setIpfsHashInfo(hashInfo)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
      toggleInvalid({ appData: true })
    }
  }

  const handleIPFSOnChange = ({ formData: ipfsData }: FormProps): void => {
    setIpfsCredentials(ipfsData)
    if (JSON.stringify(ipfsData) !== JSON.stringify({})) {
      setDisabledIPFS(false)
    }
  }

  const onUploadToIPFS = async ({ formData }: FormProps): Promise<void> => {
    if (!network || !ipfsHashInfo) return
    setIsLoading(true)
    try {
      await COW_SDK[network]?.updateContext({ ipfs: formData })
      await COW_SDK[network]?.metadataApi.uploadMetadataDocToIpfs(handleFormatData(appDataForm))
      setIsDocUploaded(true)
    } catch (e) {
      if (INVALID_IPFS_CREDENTIALS.includes(e.message)) {
        e.message = 'Invalid API keys provided.'
      }
      setError(e.message)
      setIsDocUploaded(false)
    } finally {
      setIsLoading(false)
      toggleInvalid({ ipfs: true })
    }
  }

  return (
    <>
      <div className="form-container">
        <Form
          className="data-form"
          liveOmit
          liveValidate={invalidFormDataAttempted.appData}
          omitExtraData
          showErrorList={false}
          fields={{ cField: CustomField }}
          noHtml5Validate
          onChange={handleOnChange}
          formData={appDataForm}
          validate={handleMetadataErrors}
          transformErrors={transformErrors}
          ref={formRef}
          autoComplete="off"
          onSubmit={onSubmit}
          onError={(): void => toggleInvalid({ appData: true })}
          schema={schema}
          uiSchema={uiSchema}
        >
          <button className="btn btn-info" disabled={disabledAppData} type="submit">
            GENERATE APPDATA DOC
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
              textToCopy={JSON.stringify(handleFormatData(appDataForm), null, 2)}
              contentsToDisplay={
                <pre className="json-formatter">{JSON.stringify(handleFormatData(appDataForm), null, 2)}</pre>
              }
            />
            {ipfsHashInfo && (
              <>
                <h4>AppData Hash</h4>
                <RowWithCopyButton
                  className="appData-hash"
                  textToCopy={ipfsHashInfo.appDataHash}
                  contentsToDisplay={ipfsHashInfo.appDataHash}
                />
              </>
            )}
          </div>
        </AppDataWrapper>
      </div>
      <div className="ipfs-container">
        {ipfsHashInfo && (
          <>
            <IpfsWrapper>
              <Form
                className="data-form"
                showErrorList={false}
                onSubmit={onUploadToIPFS}
                liveValidate={invalidFormDataAttempted.ipfs}
                onChange={handleIPFSOnChange}
                formData={ipfsCredentials}
                validate={handleIPFSErrors}
                fields={{ cField: CustomField }}
                ref={ipfsFormRef}
                noHtml5Validate
                onError={(): void => toggleInvalid({ ipfs: true })}
                transformErrors={transformErrors}
                schema={ipfsSchema}
                uiSchema={ipfsUiSchema}
              >
                <button className="btn btn-info" disabled={disabledIPFS} type="submit">
                  UPLOAD APPDATA TO IPFS
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
    </>
  )
}

export default FormPage
