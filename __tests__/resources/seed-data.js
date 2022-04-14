const createTodoMutation = /* GraphQL */ `
    mutation createTodo(
        $input: CreateBlogInput!
        $condition: ModelBlogConditionInput
    ) {
        createTodo(input: $input, condition: $condition) {
          id
          name
          description
        }
    }
`


const createTodo = {
  mutation: createTodoMutation,
  // override_auth: "API_KEY", // One of ["AWS_IAM", "API_KEY", "AMAZON_COGNITO_USER_POOLS"]
  data: [
    { id: 1, name: 'some', description: 'Lorem ipsum stuff' },
    { id: 2, name: 'nothing', description: 'Lorem ipsum stuff' }
  ]
}

module.exports =  {
  createTodo
}