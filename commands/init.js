const fs = require('fs')

const fsPromises = fs.promises
const fg = require('fast-glob')
const path = require('path')

const utils = require('../utils/directory-functions')
const constants = require('../utils/constants')

const { askCLIConfirmation, askCLIOptions } = require('../utils/cli-input-queries')
const { getAwsExports } = require('../utils/directory-functions')

const createdFiles = []

async function run (context) {
  // Step 1: Find existing mutations file in src/
  const mutationsFile = await findMutationsFile(context)

  // Step 2: Create amplify/backend/seeding directory if it doesn't exist
  const seedDir = utils.getSeedingDirectory(context)
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir)
  }

  // Step 3: Create Sample Mutations for custom mutations
  await createMutationFile(context, mutationsFile)

  // Step 4: Create seeding file in amplify/backend/seeding with some example mutations
  await createSeedingFile(context, mutationsFile)

  // Step 5: Create Hook files
  await createHookFiles(context)

  // Step 6: Create credentials and .gitignore file to help run queries without re-entering credentials every time
  await createCredentialFiles(context)

  // Step 7: Create configuration file
  await createConfigurationFile(context)

  // Step 8: Print results of all files added
  if (createdFiles.length > 0) {
    context.print.success('\n\n✅  Seeding files have been created successfully (see below), you can edit them and run the \'amplify graphql-seed run\' command to seed your database. \n')
    for (const file of createdFiles) {
      context.print.info(`New file: ${file}`)
    }
    context.print.success(`\nTo get started, we recommend going to the ${seedDir + '/' + constants.SEED_FILE_NAME} file \n`)
    context.print.info('\n')
  } else {
    context.print.error('No new files generated')
  }
}

async function findMutationsFile (context) {
  context.print.info('Looking for a "mutations.*" file in the src/ folder ... ')
  const srcFolder = utils.getSrcFolder(context)
  const entries = await fg([`${srcFolder}/**/mutations.*`])

  if (entries.length > 0) {
    context.print.info('Found a mutations file: ' + entries[0])
    const mutationsFile = entries[0]
    return mutationsFile
  }
  context.print.info("Didn't find mutations file")
  return null
}

async function createMutationFile (context, mutationsFile) {
  if (mutationsFile === null) {
    context.print.info('Since no mutations file found, creating a sample mutations file')
  } else {
    context.print.info('Creating an additional mutations file to complement the auto-generated mutations')
  }
  await addInitFile(context, constants.SAMPLE_MUTATIONS_FILE_NAME, constants.DEFAULT_MUTATION_FILENAME)
}

async function createSeedingFile (context, mutationsFile) {
  const seedFile = utils.getSeedingFileLocation(context, constants.SEED_FILE_NAME)

  // Skip creation if seeding file already exists
  if (fs.existsSync(seedFile)) {
    context.print.info('Seeding file already exists - skipping creation ... ')
    return
  }

  let importString = ''
  if (mutationsFile !== null) {
    // There is a mutations file, so add two mutations and the sample one as custom mutation
    require = require('esm')(module) // eslint-disable-line no-global-assign
    importString = importString.concat("require('esm')(module)")
    importString = importString.concat(`const mutations = require("${path.relative(path.dirname(seedFile), mutationsFile)}")\n`)
    importString = importString.concat(`const customMutations = require("./${constants.DEFAULT_MUTATION_FILENAME})"`)
  } else {
    // There is no auto-generated mutations file in src/, add the mutations file from seeding directory as main mutations import
    importString = importString.concat(`import * as mutations from "./${constants.DEFAULT_MUTATION_FILENAME}"`)
  }

  // Create the seed file
  const createdSeedFile = await addInitFile(context, constants.SAMPLE_SEED_FILE_NAME, constants.SEED_FILE_NAME)

  // Add the appropriate import to the resulting file
  fs.readFile(createdSeedFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    const result = data.replace('$IMPORTS', importString)

    fs.writeFile(seedFile, result, 'utf8', function (err) {
      if (err) return console.log(err)
    })
  })
}

async function createCredentialFiles (context) {
  // credentials.json and .gitignore files
  await addInitFile(context, constants.EXAMPLE_CREDENTIALS_FILENAME, constants.CREDENTIALS_FILENAME)
  await addInitFile(context, constants.EXAMPLE_GITIGNORE_FILENAME, constants.GITIGNORE_FILENAME)
}

async function createConfigurationFile (context) {
  const awsExports = await getAwsExports(context)

  const jsonObject = {
    mutationsFile: constants.DEFAULT_MUTATION_FILENAME,
    seedDataFile: constants.SEED_FILE_NAME,
    remoteSeedingEnvs: ["dev"], // eslint-disable-line quotes
    remoteSeedingEnvironmentVariable: "USER_BRANCH", // eslint-disable-line quotes
    defaultAuthenticationType: awsExports.aws_appsync_authenticationType || '',
    region: awsExports.aws_project_region || ''
  }

  const json = JSON.stringify(jsonObject, null, '\t')
  const configurationFile = utils.getSeedingFileLocation(context, constants.CONFIGURATIONS_FILENAME)
  try {
    await fsPromises.writeFile(configurationFile, json, 'utf-8')
    createdFiles.push(configurationFile)
  } catch (error) {
    context.print.error(error)
    throw error
  }
}

async function createHookFiles (context) {
  let hookEnvironments = []

  const remoteSeed = context.parameters.options[constants.REMOTE_SEED_ARGUMENT]
  const localSeed = context.parameters.options[constants.LOCAL_SEED_ARGUMENT]

  if (remoteSeed === undefined && localSeed === undefined) {
    context.print.info('No environments provided')
    const options = [{ name: constants.LOCAL_ENVIRONMENT, checked: true }, { name: constants.REMOTE_ENVIRONMENT }]
    const seedingEnvironments = await askCLIOptions('Do you want to add hooks for local and/or remote seeding?', options)
    hookEnvironments = seedingEnvironments
  } else {
    if (remoteSeed === true) { hookEnvironments.push(constants.REMOTE_ENVIRONMENT) }
    if (localSeed === true) { hookEnvironments.push(constants.LOCAL_ENVIRONMENT) }
  }

  if (hookEnvironments.length > 0) {
    const hooksDirectory = utils.getHooksDirectory(context)
    if (!fs.existsSync(hooksDirectory)) {
      fs.mkdirSync(hooksDirectory)
    }
  }

  for (const hookEnvironment of hookEnvironments) {
    const hookFileSets = constants.ENVIROMENT_HOOK_FILES[hookEnvironment]
    for (const hookFileSet of hookFileSets) {
      await addInitFile(context, hookFileSet.source, hookFileSet.dest, true)
    }
  }
}

/**
 * This function will take a file from the sample-files from the graphql-seed plugin and copy them to the amplify/backend/seeding directory
 * @param {*} context - context of the plugin
 * @param {*} srcFileName - file name of the sample file
 * @param {*} destFileName - file name of the destination file
 * @param {*} hookFile - specify whether or not to add file in the hooks folder
 * @returns file location of resulting file if successful
 */
async function addInitFile (context, srcFileName, destFileName, hookFile = false) {
  const overwrite = context.parameters.options[constants.OVERWRITE_FILES_ARGUMENT]
  const srcFile = utils.getSampleFileLocation(context, srcFileName)
  const destFile = hookFile ? utils.getHooksFileLocation(context, destFileName) : utils.getSeedingFileLocation(context, destFileName)

  try {
    if (fs.existsSync(destFile) && !await utils.checkFilesAreTheSame(srcFile, destFile) && !overwrite) {
      const override = await askCLIConfirmation(`Found an existing file: ${destFileName}, do you want to override it?`)
      if (override !== 'true') { return }
    }
    await fsPromises.copyFile(srcFile, destFile)
    createdFiles.push(destFile)
    return destFile
  } catch (error) {
    context.print.error(error)
    throw error
  }
}

module.exports = {
  run
}
