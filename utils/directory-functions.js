const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const fg = require('fast-glob')
const fsPromises = fs.promises
const constants = require('../utils/constants')

const {
  SEED_BACKEND_FOLDER,
  SAMPLE_DIRECTORY
} = require('./constants')

const getFileHash = async (path) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1')
    const stream = fs.createReadStream(path)
    stream.on('error', err => reject(err))
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

module.exports.checkFilesAreTheSame = async (file1, file2) => {
  return await getFileHash(file1) === await getFileHash(file2)
}

module.exports.getProjectRoot = (context) => {
  return path.normalize(path.join(context.amplify.pathManager.searchProjectRootPath()))
}

module.exports.getMockDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, '../mock-data/dynamodb'))
}

module.exports.getHooksDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, '../hooks'))
}

module.exports.getHooksFileLocation = (context, fileName) => {
  const getHooksFileLocation = getHooksDirectory(context)
  return path.normalize(path.join(getHooksFileLocation, fileName))
}

module.exports.getBackendDirectory = (context) => {
  return context.amplify.pathManager.getBackendDirPath()
}

module.exports.getSeedingDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, SEED_BACKEND_FOLDER))
}

module.exports.getSampleDirectory = () => {
  return path.normalize(path.join(__dirname, SAMPLE_DIRECTORY))
}

module.exports.getSampleFileLocation = (context, fileName) => {
  const sampleDir = getSampleDirectory(context)
  return path.normalize(path.join(sampleDir, fileName))
}

module.exports.getSeedingFileLocation = (context, fileName) => {
  const seedDir = getSeedingDirectory(context)
  return path.normalize(path.join(seedDir, fileName))
}

module.exports.getSrcFolder = (context) => {
  const projectRoot = getProjectRoot(context)
  return path.normalize(path.join(projectRoot, 'src'))
}

module.exports.getAwsExportsFile = async (context) => {
  const srcFolder = path.normalize(path.join(context.amplify.pathManager.searchProjectRootPath(), 'src/'))
  const awsExportsFiles = await fg([`${srcFolder}/**/aws-exports.*`])
  if (awsExportsFiles.length === 0) {
    context.print.error('No aws-exports file found.')
    throw 'aws-exports.js file does not exist!'
  }
  const awsExportsFile = awsExportsFiles[0]
  return await import(awsExportsFile)
}

module.exports.getCredentialsFileData = async (context) => {
  const seedDir = await getSeedingDirectory(context)
  try {
    const data = await fsPromises.readFile(`${seedDir}/${constants.CREDENTIALS_FILENAME}`)
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      context.print.info("The credentials.json file does not exist. That's ok, we'll get credentials from CLI prompt or command arguments.")
    } else {
      context.print.error('Error parsing the credentials.json')
      context.print.error(error)
      throw error
    }
  }
}

module.exports.getConfigurationData = async (context) => {
  const seedDir = await getSeedingDirectory(context)
  try {
    const data = await fsPromises.readFile(`${seedDir}/${constants.CONFIGURATIONS_FILENAME}`)
    return JSON.parse(data)
  } catch (error) {
    context.print.error("Error fetching configuration file. Make sure to run the 'amplify graphql-seed init' command first")
    context.print.error(error)
    throw error
  }
}
