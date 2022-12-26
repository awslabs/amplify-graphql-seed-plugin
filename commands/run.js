require = require('esm')(module) // eslint-disable-line no-global-assign

const { Amplify, API, Auth, graphqlOperation } = require('aws-amplify')

const path = require('path')

const AWSAppSyncClient = require('aws-appsync').default
const { defaultProvider } = require('@aws-sdk/credential-provider-node')

const gql = require('graphql-tag')

const {
  getAwsExports,
  getSeedingDirectory,
  getConfigurationData,
  getCredentialsFileData
} = require('../utils/directory-functions')

const { getCredentialsFromCLI } = require('../utils/cli-input-queries')

const {
  COGNITO_AUTHENTICATION,
  API_KEY_AUTHENTICATION,
  AWS_IAM_AUTHENTICATION,
  MOCKCREDENTIALS
} = require('../utils/constants')

const {
  validateInputArguments,
  validateCredentialsSchema,
  validateGraphqlEndpoint
} = require('../utils/validation')

async function run (context) {
  // Step 1: Validate input arguments from CLI.
  validateInputArguments(context.parameters.options, context)

  // Step 2: Import all the configuration files
  const awsExports = await getAwsExports(context)
  const configurationData = await getConfigurationData(context)

  const seedDir = getSeedingDirectory(context)
  const seedDataFile = path.join(seedDir, configurationData.seedDataFile)
  const seedData = require(seedDataFile)

  // Step 3: Get necessary parameters from config files and initialize Amplify package
  Amplify.configure(awsExports)

  const graphqlEndpoint = awsExports.aws_appsync_graphqlEndpoint
  validateGraphqlEndpoint(graphqlEndpoint, context)

  const defaultAuthenticationType = configurationData.defaultAuthenticationType
  const region = configurationData.region || awsExports.aws_project_region

  const remote = context.parameters.options.remote !== undefined

  // If this is a remote seeding operation, make sure that we run this in the right environment
  checkRemoteRequirements(context, remote, configurationData)

  const mutationProps = {
    defaultAuthenticationType,
    endpoint: graphqlEndpoint,
    apiKey: awsExports.aws_appsync_apiKey || null,
    region,
    remote
  }

  // Step 4: Add items to the database
  context.print.info(`Seeding your DB at: ${graphqlEndpoint}`)
  addItems(seedData, context, mutationProps)
}

const addItems = async (seedData, context, mutationProps) => {
  const seedOperations = Object.keys(seedData)

  const authenticationMethods = seedOperations.map(item => seedData[item].override_auth || mutationProps.defaultAuthenticationType)

  // Initialize auth clients depending on necessary options from authenticationMethods variable.
  mutationProps.clients = await getAuthClients(authenticationMethods, context, mutationProps)

  // Iterate over all items in seed-data file
  for (const operation of seedOperations) {
    // Select the authentication method for a table/schema
    let authenticationToUse = mutationProps.defaultAuthenticationType
    const overrideAuth = seedData[operation].override_auth

    if (overrideAuth && [COGNITO_AUTHENTICATION, AWS_IAM_AUTHENTICATION, API_KEY_AUTHENTICATION].includes(overrideAuth)) {
      authenticationToUse = overrideAuth
    }

    const mutation = seedData[operation].mutation
    const data = seedData[operation].data

    // Todo - migrate to TypeScript and turn this into an interface
    const executionProps = {
      mutation,
      data,
      context,
      authenticationToUse,
      mutationProps,
      operation
    }

    await executeMutationsFromOperation(executionProps)
    context.print.info('\n')
  }
}

const checkRemoteRequirements = (context, remote, configurationData) => {
  if (remote === true) {
    const remoteSeedingEnvs = configurationData.remoteSeedingEnvs
    const remoteSeedEnvironmentVariable = configurationData.remoteSeedingEnvironmentVariable
    const environmentVariableValue = process.env[remoteSeedEnvironmentVariable]
    if (environmentVariableValue === undefined) {
      context.print.error(`Remote seeding, but $${remoteSeedEnvironmentVariable} variable not found. Make sure to run the init command, and e.g. run "export USER_BRANCH=dev" if you're running this command locally`)
      throw new Error()
    } else if (!Array.isArray(remoteSeedingEnvs) || remoteSeedingEnvs.length === 0) {
      context.print.error('Could not find remote seeding environments in the configuration file')
      throw new Error()
    } else if (!remoteSeedingEnvs.includes(environmentVariableValue)) {
      context.print.error(`Current environment "${environmentVariableValue}" not in remoteSeedingEnvs - edit the configuration.json file`)
      throw new Error()
    }
  }
}

const getRightCredentialsForCognito = async (context) => {
  const cognitoCredentials = await getCredentialsFileData(context)

  let credentials = {}
  if (context.parameters.options.username && context.parameters.options.password) {
    // input from --arguments
    context.print.info('Using credentials from the cli arguments.')
    credentials.username = context.parameters.options.username
    credentials.password = context.parameters.options.password
  } else if (cognitoCredentials && validateCredentialsSchema(cognitoCredentials, context)) {
    // credentials.js input in this case
    context.print.info('Using credentials from the credentials.json file.')
    credentials.username = cognitoCredentials.username
    credentials.password = cognitoCredentials.password
  } else {
    // input from via CLI prompt
    context.print.info('Enter your credentials to authenticate with Cognito User Pools. ')
    credentials = await getCredentialsFromCLI()
  }

  return credentials
}

const loginViaCognitoUserPools = async (username, password, context) => {
  context.print.info(`\nLogging in with username: ${username}`)
  let respSignIn = null
  try {
    respSignIn = await Auth.signIn(username, password)
  } catch (e) {
    context.print.error('Could not login with Cognito User Pools')
    context.print.error(e)
    throw e
  }
  return respSignIn
}

const executeMutationsFromOperation = async (executionProps) => {
  const { mutation, data, context, authenticationToUse, mutationProps, operation } = executionProps

  let added = 0
  let skipped = 0
  let response

  for (const input of data) {
    try {
      response = await runGraphqlMutation(mutation, input, authenticationToUse, mutationProps, context)
      if (response !== false || response.errors) {
        added = added + 1
      } else {
        skipped = skipped + 1
      }
    } catch (e) {
      skipped = skipped + 1
      if (e.errors) {
        context.print.warning(e.errors[0].message)
      } else {
        context.print.warning(e)
      }
    }
  }
  context.print.success(`Added: ${added}, Skipped: ${skipped}, Operation: ${operation}`)
  return response
}

const runGraphqlMutation = async (mutation, input, authenticationToUse, mutationProps, context) => {
  let response = {}
  if (authenticationToUse === COGNITO_AUTHENTICATION) {
    response = await API.graphql({
        query: gql`${mutation}`,
        variables: { input },
        authMode: COGNITO_AUTHENTICATION
    })
  } else {
    const { clients } = mutationProps
    const client = clients[authenticationToUse]

    if (client !== null) {
      try {
        await client.mutate({ mutation: gql`${mutation}`, variables: { input } })
      } catch (e) {
        context.print.warning(e.message)
        return false
      }
    } else {
      console.error('Error getting GraphQL client')
    }
  }
  return response
}

const getAuthClients = async (authenticationMethods, context, mutationProps) => {
  const usedAuthMethod = []

  if (authenticationMethods.includes(COGNITO_AUTHENTICATION)) {
    // if cognito authentication used, login with user pools
    const credentials = await getRightCredentialsForCognito(context)
    await loginViaCognitoUserPools(credentials.username, credentials.password, context)
    usedAuthMethod.push(COGNITO_AUTHENTICATION)
  }

  const clients = {
    [AWS_IAM_AUTHENTICATION]: null,
    [API_KEY_AUTHENTICATION]: null
  }

  if (authenticationMethods.includes(API_KEY_AUTHENTICATION)) {
    if (!mutationProps.apiKey || mutationProps.apiKey === '') {
      const errorMsg = "API key specified for authentication, but credentials not found. Please add this auth method by running 'amplify api update' on your graphql API."
      context.print.error(errorMsg)
      throw new Error(errorMsg)
    }
    clients[API_KEY_AUTHENTICATION] = new AWSAppSyncClient({
      url: mutationProps.endpoint,
      region: mutationProps.region,
      auth: {
        type: API_KEY_AUTHENTICATION,
        apiKey: mutationProps.apiKey
      },
      disableOffline: true
    })
    usedAuthMethod.push(API_KEY_AUTHENTICATION)
  }

  if (authenticationMethods.includes(AWS_IAM_AUTHENTICATION)) {
    const credentials = mutationProps.remote ? defaultProvider() : MOCKCREDENTIALS
    clients[AWS_IAM_AUTHENTICATION] = new AWSAppSyncClient({
      url: mutationProps.endpoint,
      region: mutationProps.region,
      auth: {
        type: AWS_IAM_AUTHENTICATION,
        credentials
      },
      disableOffline: true
    })
    usedAuthMethod.push(AWS_IAM_AUTHENTICATION)
  }

  if (usedAuthMethod.length === 0) {
    // Ensure that there are clients to perform the mutations with, throw errors otherwise.
    context.print.error('Unable to configure any Authentication clients. Make sure either IAM, API_KEY or COGNITO_AUTHENTICATION credentials are available')
    process.exit()
  } else {
    context.print.info(`Using the following Auth methods: ${usedAuthMethod}`)
  }

  return clients
}

module.exports = {
  run
}
