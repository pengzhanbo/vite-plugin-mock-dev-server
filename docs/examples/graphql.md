# Graphql

需要安装 `graphql`。 

::: code-group
```ts [graphql.mock.ts]
import { buildSchema, graphql } from 'graphql'
const schema = buildSchema(`
type Query {
  hello: String
}
`)
const rootValue = { hello: () => 'Hello world!' }
export default defineMock({
  url: '/api/graphql',
  method: 'POST',
  body: async (request) => {
    const source = request.body.source
    const { data } = await graphql({ schema, rootValue, source })
    return data
  },
})
```
:::

::: code-group
```ts [api.ts]
const response = await fetch('/api/graphql', {
  method: 'POST',
  body: JSON.stringify({ source: '{ hello }' }) 
})
if (response.ok) {
  const data = await response.json()
}
```
:::
