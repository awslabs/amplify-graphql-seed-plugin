/* eslint-disable no-undef */
// const { Jest } = require('@jest/environment')

const { expect } = require('@jest/globals')

const runModule = require('../commands/run')
const inquirer = require('inquirer')

// inquirer.prompt = jest.mock('inquirer')
// inquirer.prompt = Jest.fn().mockResolvedValue({ email: 'some@example.com' });

test('adds 1 + 2 to equal 3', () => {
  expect(3).toBe(3)
})

test('Check if fails if missing aws-exports file', async () => {
    const context = {
      input: {
        argv: [
          'graphql-seed',
          'run'
        ],
        plugin: 'graphql-seed',
        command: 'run'
      },
      amplify: {
        pathManager: {
          searchProjectRootPath: jest.fn(() => {
            return 'mockProjectRootDirPath';
          }),
        },
        // _amplifyHelpersDirPath: '/Users/jurasmj/.nvm/versions/node/v12.19.1/lib/node_modules/@aws-amplify/cli/lib/extensions/amplify-helpers',
        // addCleanUpTask: [],
        // runCleanUpTasks: [],
        // _cleanUpTasks: [],
        // _getEnvInfo: "",
        // _getProjectMeta: "",
        // _getProjectConfig: ""
      },
      filesystem: {
        // remove: "",
        // read: "",
        // write: "",
        // exists: "",
        // isFile: "",
        // path: ""
      },
      print: {
        info: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        success: jest.fn(),
      },
      parameters: {
        argv: [],
        plugin: 'graphql-seed',
        command: 'run',
        options: {},
      },
    }

  try {
    await runModule.run(context);
  } catch (e) {
    expect(e).toBe("aws-exports.js file does not exist!")
  }
  expect(context.print.error).toBeCalledTimes(1);

})
