## 不建议的文件管理方式

有时候，我们希望能够对 mock文件进行就近管理。

比如，在一个项目中， 在其结构中，有一个 `/api` 目录，用于管理所有的 API接口文件，并暴露给其他的模块使用。

```sh
./src/api
├── goods
│   ├── list.ts
│   └── detail.ts
├── search
│   ├── keywords.ts
│   └── filters.ts
├── order
│   ├── list.ts
│   └── detail.ts
└── payment
    ├── payment.ts
    └── cancel.ts
```

很自然的会想到就近编写 mock文件，
```
./src/api
└── goods
    ├── list.ts
    ├── list.mock.ts
    ├── detail.ts
    └── detail.mock.ts
```

本插件是支持这种模式的，仅需要在配置插件时，修改插件配置即可：
```ts
export default defineConfig({
  plugins: [
    mockDevServerPlugin({
      include: ['src/api/**/*.mock.{ts,js,json,json5}']
    })
  ]
})
```

但是，对于 mock 文件，插件不推荐使用这种方式编写。

由于 `mock` 包含的内容，仅作用于在开发时，为开发调试提供支持的，并不归属于项目的主要代码，也不会在构建时、测试环境等使用，
是有别于 `unit/e2e`测试相关的代码的。采用就近管理，反而在某种程度上污染了项目源码。

将其独立到项目根目录下的 `mock` 目录中进行管理，会更加合适一些。


::: info
如果采用就近管理的方式更符合于 个人或团队的开发规范， 建议在 `/api` 目录中 新建 `__mock__` 目录进行管理。
```sh
./src/api
└── goods
    ├── __mock__
    │   ├── list.mock.ts
    │   └── detail.mock.ts
    ├── list.ts
    └── detail.ts
```
:::
