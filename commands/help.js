const { showHelp } = require('../utils/help')

async function run (context) {
  // print out the help message of your plugin
  context.print.info('')

  const commands = [
    {
      name: 'Usage',
      description: 'amplify graphql-seed [command] [options]\n \n'
    },
    {
      name: 'Commands:',
      description: ''
    },
    {
      name: 'init',
      description: 'Initializes the project, creates all the configuration files and all the sample files.'
    },
    {
      name: 'run',
      description: 'Runs the seeding script using the data from seed-data.js file and using the mutations from mutations.js file.',
      flags: [{ argument: '--remote, -r', description: '' }]
    },
    {
      name: 'delete-mock',
      description: 'Deletes data from the local database.',
      flags: []
    }

  ]

  showHelp(commands, context)
}

module.exports = {
  run
}
