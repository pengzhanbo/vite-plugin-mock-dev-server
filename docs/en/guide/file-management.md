# Directory and file management

> For a frontend project, using a well-organized mock directory structure can greatly help us manage `mock` API data.

## Directory and file names

Microservices architecture is the mainstream architecture used by backend services. Backend services provide interfaces to the frontend to call through the combination of service name and API address.
In this scenario, in order to have a clear mapping relationship with the backend microservices architecture, we should also use a directory structure in the `mock` directory to manage and organize the mocks.

For example, in an e-commerce project, the backend provides:
- **Goods service**: Provides interfaces such as product list and product details.
- **Search service**: Provides interfaces such as keyword search and filtering.
- **Order service**: Provides interfaces such as order list and order details.
- **Payment service**: Provides interfaces such as payment and cancel payment.

Correspondingly, our `mock` directory should also be divided into directories based on the service names:

```sh
./mock
├── goods
├── search
├── order
└── payment
```

For interfaces under a single service, it is recommended to manage them in separate files.

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

The benefits of doing this are that you can quickly find the corresponding interface by directory name and file name, making it easier to create and modify configuration content.

## Different Responses for the Same API with Different Request Bodies

For certain scenarios, it is necessary to return different response contents for the same API based on different request bodies.

If there is a need to differentiate no more than 3 request bodies for the same API, it is recommended to manage them in the same interface file. Since the plugin supports returning an array-formatted Mock configuration, it is easy to handle this situation in the same file.

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

Alternatively, if the array format does not allow developers to clearly differentiate the differences, you can also handle it in the same mock file by exporting named variables:

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

Please rest assured, the plugin also handles the export of named variables in the same way.

If you need to differentiate more than 3 request bodies for the same API and if they are all written in the same file, it may result in a very long file, making it difficult to manage and understand. In this scenario, it is recommended to further refine the directory structure by using the interface name as the directory and the keywords of the input parameters as the file names:

```sh
./mock
├── goods
    ├── list.mock.ts
    └── detail
        ├── apple.mock.ts
        └── banana.mock.ts
```
