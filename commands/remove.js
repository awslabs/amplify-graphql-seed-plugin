import fs from 'fs'

const fsPromises = fs.promises
const utils = require('../utils/directory-functions')
const { askCLIConfirmation, askCLIOptions } = require('../utils/cli-input-queries')

async function run (context) {
  const allDirectories = [
    {
      name: 'Mock directory',
      location: utils.getMockDirectory(context)
    },
    {
      name: 'Seed directory',
      location: utils.getSeedingDirectory(context)
    },
    {
      name: 'Hooks directory',
      location: utils.getHooksDirectory(context)
    }
  ]
  const existingDirectories = allDirectories.filter(item => fs.existsSync(item.location))
  if (existingDirectories.length === 0) {
    return context.print.error('No directories to delete')
  }
  const options = existingDirectories.map(item => ({ ...item, checked: true }))
  const directoriesToDelete = await askCLIOptions('Which folders do you want to delete?', options)
  const ack = await askCLIConfirmation(`Do you want to delete ${directoriesToDelete.join(' and ')} ?`)
  if (ack) {
    const deleted = []
    for (const directory of directoriesToDelete) {
      try {
        const directoryItem = existingDirectories.find(item => item.name === directory)
        await fsPromises.rm(directoryItem.location, { recursive: true })
        deleted.push(directory)
      } catch (e) {
        console.log(e)
        context.print.error(`Error deleting ${directory}`)
        throw e
      }
    }
    context.print.success(`Successfully deleted: ${deleted.join(' and ')}`)
  }
}

module.exports = {
  run
}
