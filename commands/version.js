async function run (context) {
  // print out the version of your plugin package
  const packageJson = require('../package.json')
  context.print.info(`Version ${packageJson.version}`)
}

module.exports = {
  run
}
