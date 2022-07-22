import { UiSchema } from '@rjsf/core'
import {
  LATEST_APP_DATA_VERSION,
  LATEST_QUOTE_METADATA_VERSION,
  LATEST_REFERRER_METADATA_VERSION,
} from '@cowprotocol/app-data'
import { JSONSchema7 } from 'json-schema'
import { AjvError } from '@rjsf/core'

export const getSchema = async (): Promise<JSONSchema7> => {
  const { default: latestSchema } = await import(`@cowprotocol/app-data/schemas/v${LATEST_APP_DATA_VERSION}.json`)
  return formatSchema(latestSchema)
}

const formatSchema = (schema: JSONSchema7): JSONSchema7 => {
  const formattedSchema = structuredClone(schema)

  deletePropertyPath(formattedSchema, 'properties.appCode.examples')
  deletePropertyPath(formattedSchema, 'properties.version.examples')
  deletePropertyPath(formattedSchema, 'properties.environment.examples')
  deletePropertyPath(formattedSchema, 'properties.metadata.properties.referrer.properties.address.examples')
  deletePropertyPath(formattedSchema, 'properties.metadata.properties.quote.properties.slippageBips.examples')

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
    quoteDependencies.enableQuote.oneOf[1] = {
      properties: {
        ...quoteDependencies.enableQuote.oneOf[1].properties,
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
    referrerDependencies.enableReferrer.oneOf[1] = {
      properties: {
        ...referrerDependencies.enableReferrer.oneOf[1].properties,
        ...referrerProperties,
      },
      required: requiredFields,
    }
    formattedSchema.properties.metadata['properties'].referrer.dependencies = referrerDependencies
  }

  return formattedSchema
}

export const uiSchema: UiSchema = {
  environment: {
    'ui:help': 'Hint: Development, Production, Staging.',
  },
}

export const transformErrors = (errors: AjvError[]): AjvError[] => {
  return errors.map((error: AjvError) => {
    if (error.property === '.metadata.referrer.address') {
      error.message = 'This is not an address.'
    }
    if (error.name === '.metadata.referrer.slippageBips') {
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

const quoteDependencies = {
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
            const: false,
          },
        },
      },
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
