# Shared Content

The plugin supports using third-party dependency libraries in `*.mock.*` files, and also supports importing local dependency files.

::: warning
Although it is possible to import project `src` files in `*.mock.*` files, it is not recommended to do so because `*.mock*` files are not directly processed by Vite's code compilation module. The use of other plugins or configurations in Vite to handle code content may cause the mock plugin to fail to parse.

This will be addressed in future versions of the plugin.
:::

Sometimes, different mock configuration files need to use utility functions or use the same set of data.

It is recommended to create a `/mock/shared` directory in the `/mock` directory to store utility functions and data content.

```sh
./mock
└── shared
    ├── database
    └── utils
```

For example, provide a wrapper function that returns data and a user data file.

::: code-group

``` ts [shared/utils/dataWrap.ts]
export function successWrap(data) {
  return {
    code: 0,
    message: 'success',
    result: data,
  }
}
```

```ts [shared/database/user.ts]
export const userMap = {
  Mark: {
    name: 'Mark',
    age: 20,
  },
  John: {
    name: 'John',
    age: 21,
  }
}
```

```ts [user/info.mock.ts]
import { userMap } from '../shared/database/user'
import { successWrap } from '../shared/utils/dataWrap'

// Match api/user/info?name=*
export default defineMock({
  url: 'api/user/info',
  body({ query }) {
    const { name } = query
    return successWrap(userMap[name])
  }
})
```

:::
