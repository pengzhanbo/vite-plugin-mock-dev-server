# 团队协作

在多人团队协作开发过程中，会不可避免的遇上 **多个人同时修改某一份`mock file`**，导致代码冲突的问题。

一方面，可以通过建立一些协作方案，指定 `mock file` 维护规范，来避免问题。
另一方面，在插件内部，也提供了 团队协作冲突问题的一种解决方案，同时也提高调试效率。

## 协作方案

在 [文件目录管理](./file-management) 中，我们给出了如何规范化，细化管理 `mock file` 的推荐方式，
但即使细化到了 **单一接口 + 参数验证** 为单个文件时，还是无法避免 多人同时改动改接口导致冲突。

在这种场景下，一种推荐的解决方案是，将 mock 文件本地化，忽略该 mock 文件 提交到 git：

新建 `*.local.mock.ts` 文件，并在 `gitignore` 中新增 `*.local.mock.*` 的配置。

插件依然会正确加载该文件，并且团队成员在各自的开发机本地修改该文件，由于不会被提交，可直接避免文件冲突的问题。

## referer query

> 感谢 [jiadesen](https://github.com/jiadesen) 提出了该 `feature` 以及代码贡献！

`*.local.mock.*` 在一定程度上可以解决冲突问题，但也导致了团队成员无法直接共享这些 mock file，需要通过第三方的工具实现互传共享。

其实，只要提供一种不用 mock api 的 `request headers/body/query/params` 做 `validator` 的方式，就可以很好的解决这个问题。

那么，选择使用发起 mock api 的来源页地址来区分，是一种很好的方式，因为这种方式可以使我们直接在 浏览器地址栏中，直接修改地址即可区分返回不同的参数！

而发起 mock api 的来源页地址，也将会附带在 `mock request` 的 `referer` 字段上，所以插件内可以通过解析 `referer` 来实现 一个新的 `validator` 。

如以下配置：

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/demo',
  validator: {
    refererQuery: {
      a: 1
    }
  },
  body: {
    message: 'request from "http://example.com/?a=1"'
  }
})
```

`/api/demo` 接口只会响应来自带了 `?a=1` 的请求来源地址，如 `http://example.com/?a=1`。

所以可以基于 `refererQuery`，进行 mock file 的拆分，根据 团队指定的协作规范，细化文件管理。

而直接通过修改 浏览器地址栏的地址，还可以直接跳过vite编译，直接重新加载页面数据，提高调试效率。
