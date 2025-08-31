import type { ResolvedMockServerPluginOptions } from '../options'
import type { ServerBuildOption } from '../types'

export function generatorServerEntryCode({
  proxies,
  wsProxies,
  cookiesOptions,
  bodyParserOptions,
  priority,
  build,
}: ResolvedMockServerPluginOptions) {
  const { serverPort, log } = build as ServerBuildOption
  // 生成的 entry code 有一个 潜在的问题：
  // formidableOptions 配置在 `vite.config.ts` 中，`formidableOptions` 配置项
  // 支持 function，并不能被 `JSON.stringify` 转换，故会导致生成的
  // 代码中 `formidableOptions` 与 用户配置不一致。
  // 一种解决方式是使用单独的 `vite.mock.config.ts` 之类的插件独立配置文件来处理该问题
  // 但是目前也仅有 需要 build mock server 时有这个 `formidableOptions` 的配置问题，
  // 从功能的优先级上看，还没有实现 `mock.config.ts` 的必要性。
  // 当前也还未收到有用户有关于该功能的潜在问题报告，暂时作为一个 待优化的问题。
  return `import { createServer } from 'node:http';
import connect from 'connect';
import corsMiddleware from 'cors';
import { createMockMiddleware, createLogger, mockWebSocket } from 'vite-plugin-mock-dev-server/server';
import mockData from './mock-data.js';

const app = connect();
const server = createServer(app);
const logger = createLogger('mock-server', '${log}');
const proxies = ${JSON.stringify(proxies)};
const wsProxies = ${JSON.stringify(wsProxies)};
const cookiesOptions = ${JSON.stringify(cookiesOptions)};
const bodyParserOptions = ${JSON.stringify(bodyParserOptions)};
const priority = ${JSON.stringify(priority)};
const compiler = { mockData }

mockWebSocket(compiler, server, { wsProxies, cookiesOptions, logger });

app.use(corsMiddleware());
app.use(createMockMiddleware(compiler, {
  formidableOptions: { multiples: true },
  proxies,
  priority,
  cookiesOptions,
  bodyParserOptions,
  logger,
}));

server.listen(${serverPort});

console.log('listen: http://localhost:${serverPort}');
`
}
