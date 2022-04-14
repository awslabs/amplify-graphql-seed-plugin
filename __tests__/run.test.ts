import { Seeder } from "../utils/seeder";
import awsExports from "./resources/awsExports"
import * as seedData from "./resources/seed-data"
import {jest} from '@jest/globals'
import { default as AWSAppSyncClient } from 'aws-appsync'
import {AWS_IAM_AUTHENTICATION, MOCKCREDENTIALS } from "../utils/constants";
jest.mock("aws-appsync")

const context = {
    input: {
        argv: [
            'graphql-seed',
            'run'
        ],
        plugin: 'graphql-seed',
        command: 'run'
    },
    amplify: {
        pathManager: {
            searchProjectRootPath: jest.fn(() => {
                return './sample-test-dir/';
            }),
        },
    },
    filesystem: {
    },
    print: {
        info: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        success: jest.fn(),
    },
    parameters: {
        argv: [],
        plugin: 'graphql-seed',
        command: 'run',
        options: {},
    },
}


it("Check if IAM client created", () => {
    const configurationData = {
        "mutationsFile": "customMutations.js",
        "seedDataFile": "seed-data.js",
        "defaultAuthenticationType": 'AWS_IAM',
        "region": "eu-west-2"
    }
    const clients = {}
    // const clients = {AWS_IAM_AUTHENTICATION: jest.fn()}
    const seeder = new Seeder(awsExports, seedData, configurationData, context, false, clients)
    seeder.executeMutations()

    expect(AWSAppSyncClient).toBeCalledTimes(1);
});


const AWSAppSyncClientMock = jest
    .spyOn(AWSAppSyncClient.prototype, 'mutate')
    // @ts-ignore
    .mockImplementation(() => {
        console.log('mutated');
    }); // comment this line if just want to "spy

it("Check if IAM client used to run the mutate method", () => {
    const configurationData = {
        "mutationsFile": "customMutations.js",
        "seedDataFile": "seed-data.js",
        "defaultAuthenticationType": 'AWS_IAM',
        "region": "eu-west-2"
    }
    const clients = {}
    // const clients = {AWS_IAM_AUTHENTICATION: jest.fn()}
    const seeder = new Seeder(awsExports, seedData, configurationData, context, false, clients)
    seeder.executeMutations()

    expect(AWSAppSyncClientMock).toBeCalledTimes(1);
});
