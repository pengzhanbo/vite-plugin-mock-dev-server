# Using the faker-js library

Generate mock data using the `faker-js` library.

::: tip
You need to manually install the `faker-js` library

```sh
pnpm add -D @faker-js/faker
```

:::

```ts
import { faker } from '@faker-js/faker'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/user',
  body: {
    userId: faker.datatype.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  }
})
```
