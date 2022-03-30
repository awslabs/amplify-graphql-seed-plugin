const fs = require('fs')

const fsPromises = fs.promises

const utils = require('../utils/directory-functions')

async function run (context) {
  const mockDirectory = utils.getMockDirectory(context)

  if (!fs.existsSync(mockDirectory)) {
    return context.print.error('No mock-data folder found at amplify/mock-data')
  }

  await fsPromises.rm(mockDirectory, { recursive: true })
}

module.exports = {
  run
}
