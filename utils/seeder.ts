// require from('esm')(module) // eslint-disable-line no-global-assign
import  { Amplify, API, Auth, graphqlOperation } from 'aws-amplify'

import { default as AWSAppSyncClient } from 'aws-appsync'
import  { defaultProvider } from '@aws-sdk/credential-provider-node'

import gql from 'graphql-tag'

import  {
    getCredentialsFileData
} from './directory-functions'

import  { getCredentialsFromCLI } from './cli-input-queries'

import  {
    COGNITO_AUTHENTICATION,
    API_KEY_AUTHENTICATION,
    AWS_IAM_AUTHENTICATION,
    MOCKCREDENTIALS
} from './constants'

import {
    validateCredentialsSchema
} from './validation'


class Seeder {
    awsExports: string
    seedData: any
    seedOperations: any
    configurationData: any
    remote: boolean
    context: any
    mutationProps: any
    clients: any


    constructor (awsExports: any, seedData: any, configurationData: any, context: any, remote: boolean, clients = {}) {
        this.awsExports = awsExports
        this.seedData = seedData
        this.seedOperations = Object.keys(this.seedData)
        this.configurationData = configurationData
        this.remote = remote
        this.context = context
        this.clients = clients
        this.mutationProps = {
            defaultAuthenticationType: configurationData.defaultAuthenticationType,
            endpoint: awsExports.aws_appsync_graphqlEndpoint,
            apiKey: awsExports.aws_appsync_apiKey || null,
            region: configurationData.region || awsExports.aws_project_region,
            remote,
        }
        this.initializeAuthClients(this.seedData, this.context, this.mutationProps)
        Amplify.configure(awsExports)
    }

    async executeMutations () {
        console.log("clients", this.clients)
        for (const operation of this.seedOperations) {
            // Select the authentication method for a table/schema
            let authenticationToUse = this.mutationProps.defaultAuthenticationType
            const overrideAuth = this.seedData[operation].override_auth

            if (overrideAuth && [COGNITO_AUTHENTICATION, AWS_IAM_AUTHENTICATION, API_KEY_AUTHENTICATION].includes(overrideAuth)) {
                authenticationToUse = overrideAuth
            }

            const mutation = this.seedData[operation].mutation
            const data = this.seedData[operation].data

            // Todo - migrate to TypeScript and turn this into an interface
            const executionProps = {
                mutation,
                data,
                context: this.context,
                authenticationToUse,
                mutationProps: this.mutationProps,
                operation
            }

            await this.executeMutationsFromOperation(executionProps)
            this.context.print.info('\n')
        }
    }

    async executeMutationsFromOperation (executionProps: any) {
        const { mutation, data, context, authenticationToUse, mutationProps, operation } = executionProps

        let added = 0
        let skipped = 0
        let response

        for (const input of data) {
            try {
                response = await this.runGraphqlMutation(mutation, input, authenticationToUse, mutationProps, context)
                // @ts-ignore
                if (response !== false || response.errors) {
                    added = added + 1
                } else {
                    skipped = skipped + 1
                }
            } catch (e) {
                skipped = skipped + 1
                // @ts-ignore
                if (e.errors) {
                    // @ts-ignore
                    context.print.warning(e.errors[0].message)
                } else {
                    context.print.warning(e)
                }
            }
        }
        context.print.success(`Added: ${added}, Skipped: ${skipped}, Operation: ${operation}`)
        return response
    }

    async runGraphqlMutation (mutation: any, input: any, authenticationToUse: any, mutationProps: any, context: any) {
        let response = {}
        if (authenticationToUse === COGNITO_AUTHENTICATION) {
            response = await API.graphql(graphqlOperation(
                mutation, { input }
            ))
        } else {
            const { clients } = mutationProps
            const client = clients[authenticationToUse]
            if (client !== null) {
                try {
                    await client.mutate({ mutation: gql`${mutation}`, variables: { input } })
                } catch (e) {
                    // @ts-ignore
                    context.print.warning(e.message)
                    return false
                }
            } else {
                console.error('Error getting GraphQL client')
            }
        }
        return response
    }

    async initializeAuthClients (seedData: any, context: any, mutationProps: any) {
        if (Object.keys(this.clients).length !== 0) {
            return
        }

        // @ts-ignore
        const authenticationMethods = this.seedOperations.map(item => this.seedData[item].override_auth || mutationProps.defaultAuthenticationType)

        // Initialize auth clients depending on necessary options from authenticationMethods variable.
        const usedAuthMethod = []

        if (authenticationMethods.includes(COGNITO_AUTHENTICATION)) {
            // if cognito authentication used, login with user pools
            const credentials = await this.getRightCredentialsForCognito(context)
            // @ts-ignore
            await this.loginViaCognitoUserPools(credentials.username, credentials.password, context)
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
            // @ts-ignore
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
            // @ts-ignore
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
            throw new Error("No Auth clients configured.")
            // process.exit()
        } else {
            context.print.info(`Using the following Auth methods: ${usedAuthMethod}`)
        }

        this.mutationProps.clients = clients
    }

    async getRightCredentialsForCognito (context: any) {
        const cognitoCredentials = await getCredentialsFileData(context)
        let credentials = {}
        if (context.parameters.options.username && context.parameters.options.password) {
            // input from --arguments
            context.print.info('Using credentials from the cli arguments.')
            // @ts-ignore
            credentials.username = context.parameters.options.username
            // @ts-ignore
            credentials.password = context.parameters.options.password
        } else if (cognitoCredentials && validateCredentialsSchema(cognitoCredentials, context)) {
            // credentials.js input in this case
            context.print.info('Using credentials from the credentials.json file.')
            // @ts-ignore
            credentials.username = cognitoCredentials.username
            // @ts-ignore
            credentials.password = cognitoCredentials.password
        } else {
            // input from via CLI prompt
            context.print.info('Enter your credentials to authenticate with Cognito User Pools. ')
            credentials = await getCredentialsFromCLI()
        }

        return credentials
    }

    async loginViaCognitoUserPools (username: any, password: any, context: any) {
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
}



export { Seeder };
