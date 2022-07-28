import { AjvError } from '@rjsf/core'
import {
  LATEST_APP_DATA_VERSION,
  LATEST_QUOTE_METADATA_VERSION,
  LATEST_REFERRER_METADATA_VERSION,
  getAppDataSchema,
} from '@cowprotocol/app-data'
import { JSONSchema7 } from 'json-schema'

const ERROR_MESSAGES = {
  REQUIRED: 'Required field.',
  INVALID_ADDRESS: 'This is not an address.',
  ONLY_DIGITS: 'Only digits are allowed.',
}

export const INITIAL_FORM_VALUES = {
  version: LATEST_APP_DATA_VERSION,
  metadata: {},
}

export const getSchema = async (): Promise<JSONSchema7> => {
  const latestSchema = (await getAppDataSchema(LATEST_APP_DATA_VERSION)).default as JSONSchema7
  deleteAllPropertiesByName(latestSchema, 'examples')
  deleteAllPropertiesByName(latestSchema, '$id')
  return formatSchema(latestSchema)
}

const formatSchema = (schema: JSONSchema7): JSONSchema7 => {
  const formattedSchema = structuredClone(schema)

  if (formattedSchema?.properties?.version) {
    formattedSchema.properties.version['readOnly'] = true
    formattedSchema.properties.version['default'] = LATEST_APP_DATA_VERSION
  }

  if (formattedSchema?.properties?.metadata['properties'].quote) {
    const requiredFields = formattedSchema.properties.metadata['properties'].quote.required
    deletePropertyPath(formattedSchema, 'properties.metadata.properties.quote.required')

    formattedSchema.properties.metadata['properties'].quote.properties.version['readOnly'] = true
    formattedSchema.properties.metadata['properties'].quote.properties.version['default'] =
      LATEST_QUOTE_METADATA_VERSION

    formattedSchema.properties.version['default'] = LATEST_APP_DATA_VERSION
    const quoteProperties = formattedSchema.properties.metadata['properties'].quote.properties
    formattedSchema.properties.metadata['properties'].quote.properties = {
      enableQuote: { type: 'boolean', title: 'Enable/Disable' },
    }
    quoteDependencies.enableQuote.oneOf[0] = {
      properties: {
        ...quoteDependencies.enableQuote.oneOf[0].properties,
        ...quoteProperties,
      },
      required: requiredFields,
    }
    formattedSchema.properties.metadata['properties'].quote.dependencies = quoteDependencies
  }

  if (formattedSchema?.properties?.metadata['properties'].referrer) {
    const requiredFields = formattedSchema.properties.metadata['properties'].referrer.required
    deletePropertyPath(formattedSchema, 'properties.metadata.properties.referrer.required')

    formattedSchema.properties.metadata['properties'].referrer.properties.version['readOnly'] = true
    formattedSchema.properties.metadata['properties'].referrer.properties.version['default'] =
      LATEST_REFERRER_METADATA_VERSION
    const referrerProperties = formattedSchema.properties.metadata['properties'].referrer.properties
    formattedSchema.properties.metadata['properties'].referrer.properties = {
      enableReferrer: { type: 'boolean', title: 'Enable/Disable' },
    }
    referrerDependencies.enableReferrer.oneOf[0] = {
      properties: {
        ...referrerDependencies.enableReferrer.oneOf[0].properties,
        ...referrerProperties,
      },
      required: requiredFields,
    }
    formattedSchema.properties.metadata['properties'].referrer.dependencies = referrerDependencies
  }

  return formattedSchema
}

export const transformErrors = (errors: AjvError[]): AjvError[] => {
  return errors.reduce((errorsList, error) => {
    if (error.name === 'required') {
      error.message = ERROR_MESSAGES.REQUIRED
    } else {
      if (error.property === '.metadata.referrer.address') {
        error.message = ERROR_MESSAGES.INVALID_ADDRESS
      }

      if (error.property === '.metadata.quote.slippageBips') {
        error.message = ERROR_MESSAGES.ONLY_DIGITS
      }
    }

    return [...errorsList, error]
  }, [])
}

const deleteAllPropertiesByName = (schema: JSONSchema7, property: string): void => {
  if (schema[property]) {
    deletePropertyPath(schema, property)
  }
  if (!schema.properties) return
  for (const field in schema.properties) {
    deleteAllPropertiesByName(schema.properties[field] as JSONSchema7, property)
  }
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

const quoteDependencies = {
  enableQuote: {
    oneOf: [
      {
        properties: {
          enableQuote: {
            const: true,
          },
        },
        required: [],
      },
    ],
  },
}

const referrerDependencies = {
  enableReferrer: {
    oneOf: [
      {
        properties: {
          enableReferrer: {
            const: true,
          },
        },
        required: [],
      },
    ],
  },
}
