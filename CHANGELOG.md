# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
- Command to create a test-user in Cognito through the Plugin
- Integration with Secrets Manager to securely store the test-user's credentials, and use Secrets Manager when running the seeding script to fetch the credentials
- Mechanism to automatically infer the mutations and data structure from the GraphQL API, to dynamically create some sample mutations based on a user's schema
- Configuration option to link remote seeding to a specific Amplify environment

## [0.1.13] - 2022-07-04
### Changed
- Updated dependencies to latest versions
- Updated README JSON object

## [0.1.12] - 2022-06-09
### Changed
- Updated dependencies to latest versions

## [0.1.11] - 2022-04-25
### Changed
- Added our [workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/b7d84dfb-90e1-493b-9b88-549c898e044b/en-US/) to the README.md file.

## [0.1.10] - 2022-04-12
### Changed
- Moved the `seeding` folder from `amplify/backend/seeding/` to `graphql-seed/`. This is to prevent the folder being deleted after running `amplify pull`. For more information, see the [bug report](https://github.com/awslabs/amplify-graphql-seed-plugin/issues/22) by robotsrng@

### Added
- Added README.md file to be added to this new folder to give a brief explanation about the contents of the folder, e.g. for new developers.

## [0.1.9] - 2022-04-11

### Added
- Added information to the README regarding installation issues with the new Amplify CLI version (8.0.0). See this [bug report](https://github.com/aws-amplify/amplify-cli/issues/10180) for more info.

## [0.1.8] - 2022-04-01

### Changed
- Added ESM require to the run command so that the plugin, which is CommonJS, can load the ES modules for the seeding. This was causing issues in environments that didn't like mixing CommonJS and ES imports.

## [0.1.7] - 2022-03-30
### Changed
- Added Environment configuration option to allow specifying specific environments for remote seeding. E.g. to avoid seeding a production environment via CI/CD.
- Updated README to include configuration instructions for remote seeding environments

## [0.1.6] - 2022-03-08
### Changed
- Added a command to README to include command to create a new test user through the AWS CLI
- Added a section to README to indicate plans for future work
- Added Unreleased section to the CHANGELOG

## [0.1.5] - 2022-03-04

### Added
- added a badge to README linking to the NPM repo

### Changed
- comment out the example in seed-data.js file

## [0.1.3] - 2022-02-28

### Added

- First release for a public beta
- Includes the following functionality:
  - local and remote seeding for the following Authentication types: AWS_IAM, API_KEY and Cognito User pools
  - ability to link into amplify hooks to enable commands like `amplify mock --seed`

[0.1.13]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.13
[0.1.12]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.12
[0.1.11]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.11
[0.1.10]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.10
[0.1.9]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.9
[0.1.8]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.8
[0.1.7]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.7
[0.1.6]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.6
[0.1.5]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.5
[0.1.4]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.4
[0.1.3]: https://github.com/awslabs/amplify-graphql-seed-plugin/releases/tag/v0.1.3
