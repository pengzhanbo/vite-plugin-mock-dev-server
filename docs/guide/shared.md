# 共享内容

插件支持在 `*.mock.*` 文件中，使用第三方依赖库，也支持引入本地的依赖文件。

::: warning
虽然也可以在 `*.mock.*` 文件中，引入项目 `src` 文件，但由于 `*.mock*` 文件并不是直接使用 `vite` 的
代码编译模块进行处理的， `vite` 中使用其他插件，或者是其他配置对 代码内容的处理，可能导致 mock 插件解析失败，
因此不建议引入 `src` 中的文件。

在插件的未来版本规划中，将会进行处理。
:::

有时候，不同的 mock配置文件，需要使用到一些工具函数， 或者使用同一份相同的数据内容。

建议在 `/mock` 目录中，新建 `/mock/shared` 目录，用于保存 工具函数以及数据内容。

```sh
./mock
└── shared
    ├── database  # 数据
    └── utils # 工具函数
```

比如，提供一个 返回数据的包装函数，和一个 用户数据文件

::: code-group
``` ts [shared/utils/dataWrap.ts]
export const successWrap = (data) => {
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
