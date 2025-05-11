# 使用 faker-js 库

通过 `faker-js` 库生成 mock data。

::: tip
你需要自行安装 `faker-js` 库

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
