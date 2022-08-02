import React, { RefObject } from 'react'
import Form, { AjvError, FieldProps, FormValidation } from '@rjsf/core'
import {
  LATEST_APP_DATA_VERSION,
  LATEST_QUOTE_METADATA_VERSION,
  LATEST_REFERRER_METADATA_VERSION,
  getAppDataSchema,
} from '@cowprotocol/app-data'
import { JSONSchema7 } from 'json-schema'
import { HelpTooltip } from 'components/Tooltip'

const ERROR_MESSAGES = {
  REQUIRED: 'Required field.',
  INVALID_ADDRESS: 'This is not an address.',
  ONLY_DIGITS: 'Only digits are allowed.',
}

export const INITIAL_FORM_VALUES = {
  version: LATEST_APP_DATA_VERSION,
  metadata: {},
}

export const INVALID_IPFS_CREDENTIALS = [
  'Type error',
  "Failed to execute 'setRequestHeader' on 'XMLHttpRequest': String contains non ISO-8859-1 code point.",
]

export type FormProps = Record<string, any>

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

export const handleErrors = (
  ref: RefObject<Form<FormProps>>,
  errors: FormValidation,
  handler: (value: boolean) => void,
): FormValidation => {
  if (!ref.current) return errors
  const { errors: formErrors } = ref.current?.state as FormProps
  handler(formErrors.length > 0)
  return errors
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

export const ipfsSchema: JSONSchema7 = {
  type: 'object',
  required: ['pinataApiKey', 'pinataApiSecret'],
  properties: {
    pinataApiKey: {
      type: 'string',
      title: 'Pinata API key',
      description: 'Add your Pinata API key',
    },
    pinataApiSecret: {
      type: 'string',
      title: 'Pinata API secret',
      description: 'Add your Pinata API secret',
    },
  },
}

export const CustomField = (props: FieldProps): React.ReactElement => {
  const { schema, onChange, readonly, required, formData, idSchema, uiSchema } = props
  return (
    <div className="form-group field field-string">
      <div className="title-container">
        <label className="control-label" htmlFor={idSchema.$id}>
          {schema.title}
          {required && '*'}&nbsp;
        </label>
        {uiSchema.tooltip && <HelpTooltip tooltip={uiSchema.tooltip} />}
      </div>
      <p id={`${idSchema.$id}__description`} className="field-description">
        {schema.description}
      </p>
      <input
        required={required}
        readOnly={readonly}
        defaultValue={formData}
        onChange={(event): void => onChange(event.target.value || undefined)}
        className="form-control"
        id={idSchema.$id}
        type="text"
      />
    </div>
  )
}

export const uiSchema = {
  environment: {
    'ui:field': 'cField',
    tooltip: 'Select the environment to use. E.g: development, staging, production.',
  },
  version: {
    'ui:field': 'cField',
    tooltip: 'The schema will be versioned using Semantic Versioning.',
  },
  appCode: {
    'ui:field': 'cField',
    tooltip: 'The code identifying the CLI, UI, service generating the order.',
  },
  metadata: {
    referrer: {
      version: {
        'ui:field': 'cField',
        tooltip: 'The schema will be versioned using Semantic Versioning.',
      },
      address: {
        'ui:field': 'cField',
        tooltip: 'Add a valid address to enable referrer.',
      },
    },
    quote: {
      version: {
        'ui:field': 'cField',
        tooltip: 'The schema will be versioned using Semantic Versioning.',
      },
      slippageBips: {
        'ui:field': 'cField',
        tooltip: 'Set the slippage in BIPS (e.g. "0.3").',
      },
    },
  },
}

export const ipfsUiSchema = {
  pinataApiKey: {
    'ui:field': 'cField',
    tooltip: 'Add your Pinata API key.',
  },
  pinataApiSecret: {
    'ui:field': 'cField',
    tooltip: 'Add your Pinata API secret key.',
  },
}
