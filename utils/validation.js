
const Ajv = require('ajv')

const {
  RUNHELP,
  RUNARGUMENTSCHEMA
} = require('./constants')

const { showHelp } = require('../utils/help')

export const validateGraphqlEndpoint = (graphqlEndpoint, context) => {
  if (!graphqlEndpoint) {
    context.print.error('Could not find GraphQL endpoint in aws-exports.js')
    process.exit()
  }

  if (graphqlEndpoint.startsWith('https://') && context.parameters.options.remote === undefined) {
    context.print.error(`${graphqlEndpoint} seems like a remote endpoint - cannot continue. Please run the 'amplify graphql-seed run --remote' command directly`)
    process.exit()
  }
}

export const validateInputArguments = (instance, context) => {
  const ajv = new Ajv()

  const validate = ajv.compile(RUNARGUMENTSCHEMA)
  const valid = validate(instance)
  if (!valid) {
    context.print.info('Invalid input parameters. Please take a look below: \n')
    showHelp(RUNHELP, context)
    process.exit()
  }
  return valid
}

export const validateCredentialsSchema = (instance, context) => {
  const ajv = new Ajv()
  const schema = {
    type: 'object',
    properties: {
      username: { type: 'string' },
      password: { type: 'string' }
    },
    required: ['username', 'password'],
    additionalProperties: false
  }

  const validate = ajv.compile(schema)
  const valid = validate(instance)
  if (!valid) {
    context.print.warning('Invalid credentials.json file. It has to be in the format {username: xx, password: xx}')
    process.exit()
  }
  return valid
}
