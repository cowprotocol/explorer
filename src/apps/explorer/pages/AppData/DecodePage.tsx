import React, { useState } from 'react'
import Form, { FormValidation } from '@rjsf/core'
import { decodeAppDataSchema, FormProps, handleErrors, transformErrors } from './config'
import DecodeAppData from 'components/AppData/DecodeAppData'

const DecodePage: React.FC = () => {
  const [formData, setFormdata] = useState<FormProps>()
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(true)
  const [invalidFormDataAttempted, setInvalidFormDataAttempted] = useState<boolean>(false)

  const formRef = React.useRef<Form<FormProps>>(null)

  const onSubmit = async ({ formData }: FormProps): Promise<void> => {
    setFormdata(formData)
    setIsSubmitted(true)
  }

  const handleOnChange = ({ formData }: FormProps): void => {
    setFormdata(formData)
    if (isSubmitted) {
      setIsSubmitted(false)
    }
    if (JSON.stringify(formData) !== JSON.stringify({})) {
      setDisabled(false)
    }
  }

  const onError = (_: FormProps, errors: FormValidation): FormValidation => handleErrors(formRef, errors, setDisabled)

  return (
    <div className="decode-container">
      <Form
        className="data-form"
        showErrorList={false}
        onChange={handleOnChange}
        formData={formData}
        ref={formRef}
        onSubmit={onSubmit}
        transformErrors={transformErrors}
        liveValidate={invalidFormDataAttempted}
        noHtml5Validate
        validate={onError}
        onError={(): void => setInvalidFormDataAttempted(true)}
        schema={decodeAppDataSchema}
      >
        <button className="btn btn-info" disabled={disabled} type="submit">
          DECODE APP DATA
        </button>
      </Form>
      {isSubmitted && <DecodeAppData showExpanded appData={formData?.appData} />}
    </div>
  )
}

export default DecodePage
