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

export const checkFilesAreTheSame = async (file1, file2) => {
  return await getFileHash(file1) === await getFileHash(file2)
}

export const getProjectRoot = (context) => {
  return path.normalize(path.join(context.amplify.pathManager.searchProjectRootPath()))
}

export const getMockDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, '../mock-data/dynamodb'))
}

export const getHooksDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, '../hooks'))
}

export const getHooksFileLocation = (context, fileName) => {
  const getHooksFileLocation = getHooksDirectory(context)
  return path.normalize(path.join(getHooksFileLocation, fileName))
}

export const getBackendDirectory = (context) => {
  return context.amplify.pathManager.getBackendDirPath()
}

export const getSeedingDirectory = (context) => {
  const backendDir = getBackendDirectory(context)
  return path.normalize(path.join(backendDir, SEED_BACKEND_FOLDER))
}

export const getSampleDirectory = () => {
  return path.normalize(path.join(__dirname, SAMPLE_DIRECTORY))
}

export const getSampleFileLocation = (context, fileName) => {
  const sampleDir = getSampleDirectory(context)
  return path.normalize(path.join(sampleDir, fileName))
}

export const getSeedingFileLocation = (context, fileName) => {
  const seedDir = getSeedingDirectory(context)
  return path.normalize(path.join(seedDir, fileName))
}

export const getSrcFolder = (context) => {
  const projectRoot = getProjectRoot(context)
  return path.normalize(path.join(projectRoot, 'src'))
}

export const getAwsExportsFile = async (context) => {
  const srcFolder = path.normalize(path.join(context.amplify.pathManager.searchProjectRootPath(), 'src/'))
  const awsExportsFiles = await fg([`${srcFolder}/**/aws-exports.*`])
  if (awsExportsFiles.length === 0) {
    context.print.error('No aws-exports file found.')
    process.exit()
  }
  const awsExportsFile = awsExportsFiles[0]
  return await import(awsExportsFile)
}

export const getCredentialsFileData = async (context) => {
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

export const getConfigurationData = async (context) => {
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
