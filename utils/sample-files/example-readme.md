# GraphQL seed - instructions

This directory was created by [amplify-graphql-seed-plugin](https://www.npmjs.com/package/amplify-graphql-seed-plugin).

The plugin is used to seed local and/or remote databases through an Amplify GraphQL API using [Amplify Plugins](https://docs.amplify.aws/cli/plugins/plugins/).

For more information on how to use the plugin, check-out the README of the package, or the [GitHub source-code repository](github.com/awslabs/amplify-graphql-seed-plugin).

To install the Amplify Plugin, run:
```bash
npm install -g amplify-graphql-seed-plugin
amplify plugin add amplify-graphql-seed-plugin
```
To get started, check out the `seed-data.js` file to see what data is being seeded. To start seed your database you can run one of the following commands:
* `amplify graphql-seed run`
* `amplify graphql-seed run --remote`
* `amplify mock --seed`
* `amplify mock --refresh`
* `amplify push --seed`