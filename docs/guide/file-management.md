# 目录文件管理

> 对于一个前端项目，使用良好的 mock 目录结构组织管理方案，更有助于我们对`mock`接口数据的管理。

## 目录与文件命名

微服务架构是当前后端服务采用的主流架构，后端通过 **服务名+接口地址** 的形式提供接口给到前端进行调用。
在这种场景下，为能够直观的与后端的微服务架构能够有清晰的映射关系，在 `mock` 目录下，也应该采用类型的目录结构，
划分目录进行管理。

比如，在一个 电商类的项目中， 后端提供了：
- **商品服务**：提供了 商品列表、商品详情 等接口；
- **搜索服务**：提供了 关键字搜索、条件筛选 等接口；
- **订单服务**：提供了 订单列表、订单详情 等接口；
- **支付服务**：提供了 支付、取消支付 等接口；

相对应的，我们的 `mock`目录，也应根据 服务名 来划分目录：

```sh
./mock
├── goods
├── search
├── order
└── payment
```

对于单服务下的接口，推荐采用 一个接口一个文件的形式进行管理：

```sh
├── goods
│   ├── list.mock.ts
│   └── detail.mock.ts
├── search
│   ├── keywords.mock.ts
│   └── filters.mock.ts
├── order
│   ├── list.mock.ts
│   └── detail.mock.ts
└── payment
    ├── payment.mock.ts
    └── cancel.mock.ts
```

这样做的好处，能够直接通过 目录名和文件名，快速找到对应的接口，方便新建、修改 配置内容。

## 同接口入参不同响应不同

对于某些场景，需要对同一个接口，根据不同的请求体内容，返回不同的响应内容。

如果仅需要对同一个接口区分不超过3种请求体，那么建议直接写在同一个接口文件中进行管理。由于插件支持返回一个数组形式的
Mock 配置，所以可以很轻松的在同一个文件中处理这种情况：

```ts
export default defineMock([
  {
    url: 'api/goods/list',
    validator: {
      query: { page: 1 },
    },
    body: { page: 1, result: [] }
  },
  {
    url: 'api/goods/list',
    validator: {
      query: { page: 2 },
    },
    body: { page: 2, result: [] }
  }
])
```

又或者，数组的形式不能够使开发者清晰的区分差异，那么也可以通过 具名变量导出的方式，在同一个mock文件中处理：
```ts
export const appleGoods = defineMock({
  url: 'api/goods/detail',
  validator: {
    query: { id: 'apple' }
  },
  body: { goodsName: 'apple' }
})

export const bananaGoods = defineMock({
  url: 'api/goods/detail',
  validator: {
    query: { id: 'banana' }
  },
  body: { goodsName: 'banana' }
})
```

请放心，插件内部同样对处理具名变量导出的方式。

如果需要对同一个接口区分超过3种或以上请求体，如果都写在同一个文件中，那么可能导致单文件内容过长，
反而不容易直观的进行管理，在这种场景下，建议再进一步的细化目录，使用以接口名作为目录，
以入参的关键词作为文件名：

```sh
./mock
├── goods
    ├── list.mock.ts
    └── detail
        ├── apple.mock.ts
        └── banana.mock.ts
```

