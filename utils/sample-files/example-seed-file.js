$IMPORTS

export const createTodo = {
  mutation: mutations.createTodo,
  // override_auth: "API_KEY", // One of ["AWS_IAM", "API_KEY", "AMAZON_COGNITO_USER_POOLS"]
  data: [
    { id: 1, name: 'some', description: 'Lorem ipsum stuff' },
    { id: 2, name: 'nothing', description: 'Lorem ipsum stuff' }
  ]
}

/*
  // TO USE, uncomment by removing '/*' and '\*'
  //
  // ANOTHER SEED-DATA EXAMPLE:
  // CREATE A 100 TODOs, using the faker library.
  // Note: install faker by adding it to the package.json of your root-project or using npm install (https://www.npmjs.com/package/faker/v/5.5.3)
  // Note 2: the latest faker library has been emptied, and is no longer maintained. Use at your own discretion
  //
  // Example items:
  // {
  //   "id": "31",
  //   "name": "omnis-ut-neque",
  //   "description": "Aliquid eum dolorem eos quisquam iusto ratione eos."
  // },
  // {
  //   "id": "32",
  //   "name": "eveniet-culpa-eius",
  //   "description": "Impedit sit animi."
  // },

  const faker = require('faker');

  export const createTodo = {
    mutation: mutations.createTodo,
    data: Array.apply(null, {length: 100}).map((_, index) => ({ id: index, name: faker.lorem.slug(), description: faker.lorem.sentence() }))
  }
*/
