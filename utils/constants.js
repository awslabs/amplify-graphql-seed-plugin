const SEED_FILE_NAME = 'seed-data.js'
const SEED_BACKEND_FOLDER = 'graphql-seed'

const SAMPLE_MUTATIONS_FILE_NAME = 'example-mutation-file.js'

const SAMPLE_SEED_FILE_NAME = 'example-seed-file.js'
const SAMPLE_DIRECTORY = 'sample-files'

const DEFAULT_MUTATION_FILENAME = 'customMutations.js'
const CONFIGURATIONS_FILENAME = 'configuration.json'

const SAMPLE_POST_MOCK_FILENAME = 'example-post-mock-file.sh'
const POST_MOCK_FILENAME = 'post-mock.sh'

const SAMPLE_PRE_MOCK_FILENAME = 'example-pre-mock-file.sh'
const PRE_MOCK_FILENAME = 'pre-mock.sh'

const SAMPLE_POST_PUSH_FILENAME = 'example-post-push-file.sh'
const POST_PUSH_FILENAME = 'post-push.sh'

const SAMPLE_README_FILENAME = 'example-readme.md'
const README_FILENAME = 'README.md'

const REMOTE_SEED_ARGUMENT = 'remote'
const LOCAL_SEED_ARGUMENT = 'local'

const MOCKCREDENTIALS = {
  accessKeyId: 'ASIAVJKIAM-AuthRole',
  secretAccessKey: 'fake'
}

const OVERWRITE_FILES_ARGUMENT = 'overwrite-files'

const REMOTE_ENVIRONMENT = 'remote'
const LOCAL_ENVIRONMENT = 'local'

const ENVIROMENT_HOOK_FILES = {
  [LOCAL_ENVIRONMENT]: [
    {
      source: SAMPLE_POST_MOCK_FILENAME,
      dest: POST_MOCK_FILENAME
    },
    {
      source: SAMPLE_PRE_MOCK_FILENAME,
      dest: PRE_MOCK_FILENAME
    }
  ],
  [REMOTE_ENVIRONMENT]: [
    {
      source: SAMPLE_POST_PUSH_FILENAME,
      dest: POST_PUSH_FILENAME
    }
  ]
}

const COGNITO_AUTHENTICATION = 'AMAZON_COGNITO_USER_POOLS'
const AWS_IAM_AUTHENTICATION = 'AWS_IAM'
const API_KEY_AUTHENTICATION = 'API_KEY'

const EXAMPLE_CREDENTIALS_FILENAME = 'example-credentials.json'
const CREDENTIALS_FILENAME = 'credentials.json'

const EXAMPLE_GITIGNORE_FILENAME = 'example-gitignore'
const GITIGNORE_FILENAME = '.gitignore'

// THE INIT HELP should match the validation for schema in INITARGSCHEMA
const RUNHELP = [
  {
    name: 'Run',
    description: 'Runs the seeding script using the data from seed-data.js file and using the mutations from mutations.js file.'
  },
  {
    name: '\n Available options: \n',
    description: ''
  },
  {
    name: '--remote',
    description: 'Seeds your remote database instead of the local one.'
  },
  {
    name: '--username <username>',
    description: '\tPass the username to authenticate with Cognito User Pools. Used in conjunction with --password argument.'
  },
  {
    name: '--password <password>',
    description: '\tPass the password in the CLI to authenticate with Cognito User Pools. Used in conjunction with --username argument.'
  }
]

const RUNARGUMENTSCHEMA = {
  type: 'object',
  properties: {
    remote: { type: 'boolean' },
    username: { type: 'string' },
    password: { type: 'string' },
    yes: { type: 'boolean' }
  },
  required: [],
  additionalProperties: false
}

module.exports = {
  SEED_FILE_NAME,
  SEED_BACKEND_FOLDER,
  SAMPLE_SEED_FILE_NAME,
  SAMPLE_DIRECTORY,
  SAMPLE_MUTATIONS_FILE_NAME,
  DEFAULT_MUTATION_FILENAME,
  CONFIGURATIONS_FILENAME,
  SAMPLE_POST_MOCK_FILENAME,
  POST_MOCK_FILENAME,
  SAMPLE_PRE_MOCK_FILENAME,
  PRE_MOCK_FILENAME,
  REMOTE_SEED_ARGUMENT,
  OVERWRITE_FILES_ARGUMENT,
  REMOTE_ENVIRONMENT,
  LOCAL_ENVIRONMENT,
  ENVIROMENT_HOOK_FILES,
  LOCAL_SEED_ARGUMENT,
  COGNITO_AUTHENTICATION,
  AWS_IAM_AUTHENTICATION,
  API_KEY_AUTHENTICATION,
  MOCKCREDENTIALS,
  EXAMPLE_CREDENTIALS_FILENAME,
  CREDENTIALS_FILENAME,
  EXAMPLE_GITIGNORE_FILENAME,
  GITIGNORE_FILENAME,
  RUNHELP,
  RUNARGUMENTSCHEMA,
  SAMPLE_README_FILENAME,
  README_FILENAME
}
