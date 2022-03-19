/* eslint-disable no-undef */
const runModule = require('../commands/run')

jest.mock('inquirer')
// inquirer.prompt = jest.fn().mockResolvedValue({ email: 'some@example.com' });

test('adds 1 + 2 to equal 3', () => {
  expect(3).toBe(3)
})

test('Check if MutationRunner calls CLI if no data passed', () => {
    const input = {
      input: {
        argv: [
          'graphql-seed',
          'run'
        ],
        plugin: 'graphql-seed',
        command: 'run'
      },
      amplify: {
        _amplifyHelpersDirPath: '/Users/jurasmj/.nvm/versions/node/v12.19.1/lib/node_modules/@aws-amplify/cli/lib/extensions/amplify-helpers',
        addCleanUpTask: [],
        runCleanUpTasks: [],
        _cleanUpTasks: [],
        _getEnvInfo: "",
        _getProjectMeta: "",
        _getProjectConfig: ""
      },
      filesystem: {
        remove: "",
        read: "",
        write: "",
        exists: "",
        isFile: "",
        path: ""
      },
      print: {
        info: "",
        fancy: "",
        warning: "",
        error: "",
        success: "",
        table: "",
        debug: "",
        green: "",
        yellow: "",
        red: "",
        blue: ""
      },
      parameters: {
        argv: [
          '/Users/jurasmj/.nvm/versions/node/v12.19.1/bin/node',
          '/Users/jurasmj/.nvm/versions/node/v12.19.1/bin/amplify',
          'graphql-seed',
          'run'
        ],
        plugin: 'graphql-seed',
        command: 'run',
        options: {},
      },
    }

    runModule(input)
  // expect(inqui.amplify.invokePluginMethod).toBeCalledTimes(1);
})
