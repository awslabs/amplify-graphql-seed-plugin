const inquirer = require('inquirer')

module.exports.askCLIConfirmation = async (message) => {
  const answer = await inquirer.prompt([
    {
      name: 'providedAnswer',
      type: 'confirm',
      message,
      default: true
    }
  ])
  return answer.providedAnswer.toString()
}

module.exports.askCLIOptions = async (message, options) => {
  // E.g. expect options as { name: api.name, value: api.id, checked (opt): [bool] }
  const answer = await inquirer.prompt([
    {
      name: 'providedOption',
      message,
      type: 'checkbox',
      choices: options
    }
  ])
  return answer.providedOption
}

module.exports.getCredentialsFromCLI = async () => {
  const question = [
    {
      name: 'username',
      message: 'Username',
      type: 'input'
    },
    {
      name: 'password',
      message: 'Password',
      type: 'password'
    }
  ]
  return await inquirer.prompt(question)
}
