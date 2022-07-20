import { UiSchema } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'
import { AjvError, FormValidation } from '@rjsf/core'
import { isAddress } from 'web3-utils'

export const schema: JSONSchema7 = {
  title: 'Metadata Form',
  type: 'object',
  required: ['version'],
  properties: {
    appCode: { type: 'string', title: 'AppCode' },
    version: { type: 'string', title: 'Version', readOnly: true, default: '1.0.0' },
    environment: { type: 'string', title: 'Environment' },
    metadata: {
      type: 'object',
      title: 'Metadata',
      properties: {
        referrer: {
          type: 'object',
          title: 'Referrer',
          properties: {
            version: { type: 'string', title: 'Version', readOnly: true, default: '1.0.0' },
            address: { type: 'string', title: 'Address' },
          },
          required: ['version'],
        },
        quote: {
          type: 'object',
          title: 'Quote',
          properties: {
            version: { type: 'string', title: 'Quote' },
            slippageBips: { type: 'string', title: 'Slippage Bips', pattern: '^\\d*$' },
          },
        },
      },
    },
  },
}

export const uiSchema: UiSchema = {
  environment: {
    'ui:help': 'Hint: Development, Production, Staging.',
  },
}

export const validate = (formData: any, errors: FormValidation): FormValidation => {
  if (!isAddress(formData.metadata.referrer.address?.toLowerCase())) {
    errors.metadata['referrer'].address.addError('This is not an address')
  }
  return errors
}

export const transformErrors = (errors: AjvError[]): AjvError[] => {
  return errors.map((error: AjvError) => {
    if (error.name === 'pattern') {
      error.message = 'Only digits are allowed'
    }
    return error
  })
}
