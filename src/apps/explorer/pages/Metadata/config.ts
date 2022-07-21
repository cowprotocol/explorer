import { UiSchema } from '@rjsf/core'
import {
  LATEST_APP_DATA_VERSION,
  LATEST_QUOTE_METADATA_VERSION,
  LATEST_REFERRER_METADATA_VERSION,
} from '@cowprotocol/app-data'
import { JSONSchema7 } from 'json-schema'
import { AjvError, FormValidation } from '@rjsf/core'
import { isAddress } from 'web3-utils'

const schema: JSONSchema7 = {
  title: 'Metadata Form',
  type: 'object',
  required: ['version'],
  properties: {
    appCode: { type: 'string', title: 'AppCode' },
    version: { type: 'string', title: 'Version', readOnly: true, default: LATEST_APP_DATA_VERSION },
    environment: { type: 'string', title: 'Environment' },
    metadata: {
      type: 'object',
      title: 'Metadata',
      properties: {
        referrer: {
          type: 'object',
          title: 'Referrer',
          properties: {
            enableReferrer: { type: 'boolean', title: 'Enable/Disable' },
          },
          dependencies: {
            enableReferrer: {
              oneOf: [
                {
                  properties: {
                    enableReferrer: {
                      const: false,
                    },
                  },
                },
                {
                  properties: {
                    enableReferrer: {
                      const: true,
                    },
                    address: { type: 'string', title: 'Address' },
                    version: {
                      type: 'string',
                      title: 'Version',
                      readOnly: true,
                      default: LATEST_REFERRER_METADATA_VERSION,
                    },
                  },
                  required: ['version'],
                },
              ],
            },
          },
        },
        quote: {
          type: 'object',
          title: 'Quote',
          properties: {
            enableQuote: { type: 'boolean', title: 'Enable/Disable' },
          },
          dependencies: {
            enableQuote: {
              oneOf: [
                {
                  properties: {
                    enableQuote: {
                      const: false,
                    },
                  },
                },
                {
                  properties: {
                    enableQuote: {
                      const: true,
                    },
                    version: {
                      type: 'string',
                      title: 'Version',
                      default: LATEST_QUOTE_METADATA_VERSION,
                      readOnly: true,
                    },
                    slippageBips: { type: 'string', title: 'Slippage Bips', pattern: '^\\d*$' },
                  },
                  required: ['version'],
                },
              ],
            },
          },
        },
      },
    },
  },
}

export const getSchema = async (): Promise<JSONSchema7> => {
  const { default: latestSchema } = await import(`@cowprotocol/app-data/schemas/v${LATEST_APP_DATA_VERSION}.json`)
  return { ...latestSchema, ...schema } as JSONSchema7
}

export const uiSchema: UiSchema = {
  environment: {
    'ui:help': 'Hint: Development, Production, Staging.',
  },
}

export const validate = (formData: any, errors: FormValidation): FormValidation => {
  const { address, enableReferrer } = formData.metadata.referrer
  if (enableReferrer && !isAddress(address?.toLowerCase())) {
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

export const deletePropertyPath = (obj: any, path: any): void => {
  if (!obj || !path) {
    return
  }

  if (typeof path === 'string') {
    path = path.split('.')
  }

  for (let i = 0; i < path.length - 1; i++) {
    obj = obj[path[i]]

    if (typeof obj === 'undefined') {
      return
    }
  }

  delete obj[path.pop()]
}
