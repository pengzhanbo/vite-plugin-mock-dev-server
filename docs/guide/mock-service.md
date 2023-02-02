## 构建独立部署的mock服务

在一些场景中，可能会需要使用mock服务提供的数据支持，用于展示，但可能项目已完成打包构建部署，已脱离 `vite` 和本插件提供的 mock服务支持。由于本插件在设计之初，支持在mock文件中引入各种 `node` 模块，所以不能将 mock文件打包内联到客户端构建代码中。

为了能够满足这类场景，插件一方面提供了 `vite preview` 下的支持，同时还提供了在 `vite build` 时，也构建一个可独立部署的 小型mock服务应用，可以将这个应用部署到相关的环境，后通过其他http服务器如nginx做代理转发到实际端口实现mock支持。

构建默认输出到 `dist/mockServer` 目录中，并生成如下文件：
```sh
./mockServer
├── index.js
├── mock-data.js
└── package.json
```

在该目录下，执行 `npm install` 安装依赖后，可执行 `npm start` 即可启动 mock server。
默认端口为 `8080`。
可通过 `localhost:8080/` 访问相关的 `mock` 接口。
