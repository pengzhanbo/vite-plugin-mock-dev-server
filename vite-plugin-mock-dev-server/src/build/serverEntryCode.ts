import type formidable from 'formidable'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { ServerBuildOption } from '../types/index.js'
import { isArray, isPlainObject } from '@pengzhanbo/utils'
import ansis from 'ansis'

export function generatorServerEntryCode({
  proxies,
  wsProxies,
  cookiesOptions,
  bodyParserOptions,
  priority,
  build,
  cors,
  record,
  replay,
  activeScene,
  formidableOptions,
  logger,
}: ResolvedMockServerPluginOptions): string {
  const { serverPort, log } = build as ServerBuildOption
  // 生成的 entry code 有一个 潜在的问题：
  // formidableOptions 配置在 `vite.config.ts` 中，`formidableOptions` 配置项
  // 支持 function，并不能被 `JSON.stringify` 转换。
  // 这里仅序列化可被序列化的配置项，并对无法序列化的配置项输出构建期警告，
  // 避免生成的代码中 `formidableOptions` 与用户配置不一致时没有任何提示。
  // 若要完全支持 function 形式的配置，一种解决方式是使用单独的
  // `vite.mock.config.ts` 之类的插件独立配置文件，但是目前为止
  // 也仅有 需要 build mock server 时有这个 `formidableOptions` 的配置问题，
  // 从功能的优先级上看，还没有实现 `mock.config.ts` 的必要性。
  const { options: serializableFormidableOptions, unsupportedKeys } =
    pickFormidableOptions(formidableOptions)
  if (unsupportedKeys.length) {
    logger.warn(
      `The following ${ansis.bold('formidableOptions')} cannot be serialized and will be ignored in the generated mock server: ${unsupportedKeys.map((key) => ansis.yellow(key)).join(', ')}`,
    )
  }

  return `import { createServer } from 'node:http';
import process from 'node:process';
import connect from 'connect';
import { createMockMiddleware, createLogger, mockWebSocket } from 'vite-plugin-mock-dev-server/server';
import mockData from './mock-data.js';

const app = connect();
const server = createServer(app);
const logger = createLogger('mock-server', ${JSON.stringify(log)});
const proxies = ${JSON.stringify(proxies)};
const wsProxies = ${JSON.stringify(wsProxies)};
const cookiesOptions = ${JSON.stringify(cookiesOptions)};
const bodyParserOptions = ${JSON.stringify(bodyParserOptions)};
const priority = ${JSON.stringify(priority)};
const cors = ${JSON.stringify(cors)};
const activeScene = ${JSON.stringify(activeScene)};
const formidableOptions = ${JSON.stringify(serializableFormidableOptions)};
const record = {
  enabled: ${record.enabled ? 'true' : 'false'},
  cwd: process.cwd(),
  dir: ${JSON.stringify(record.dir)},
  expires: ${record.expires === Number.MAX_SAFE_INTEGER ? 'Number.MAX_SAFE_INTEGER' : record.expires},
  status: ${JSON.stringify(record.status)},
};

const compiler = { mockData }

mockWebSocket(compiler, server, { wsProxies, cookiesOptions, logger, activeScene });

app.use(createMockMiddleware(compiler, {
  formidableOptions,
  proxies,
  priority,
  cookiesOptions,
  bodyParserOptions,
  logger,
  cors,
  record,
  replay: ${replay ? 'true' : 'false'},
  activeScene,
}));

server.listen(${serverPort});

console.log('listen: http://localhost:${serverPort}');
`
}

/**
 * Pick the serializable formidable options
 *
 * 提取可序列化的 formidable 配置项
 *
 * `formidableOptions` supports functions (such as `filter`, `filename`),
 * they cannot be serialized into the generated code.
 * Such options are ignored with a warning during build.
 *
 * `formidableOptions` 支持 function 类型的配置项（如 `filter`、`filename`），
 * 它们无法被序列化到生成的代码中，这类配置项会被忽略，并在构建期输出警告。
 *
 * @param options - Formidable options / formidable 配置项
 * @returns Serializable options with the unsupported keys / 可序列化的配置项以及不支持的配置项
 */
function pickFormidableOptions(options: formidable.Options): {
  options: Record<string, unknown>
  unsupportedKeys: string[]
} {
  const serializable: Record<string, unknown> = {}
  const unsupportedKeys: string[] = []

  for (const [key, value] of Object.entries(options)) {
    if (value == null) {
      continue
    }
    if (isSerializableValue(value)) {
      serializable[key] = value
    } else {
      unsupportedKeys.push(key)
    }
  }

  return { options: serializable, unsupportedKeys }
}

/**
 * Check whether the value can be serialized by `JSON.stringify`
 *
 * 检查该配置项是否可以被 `JSON.stringify` 序列化
 *
 * @param value - Value to check / 需要检查的值
 * @returns Whether the value is serializable / 该值是否可被序列化
 */
function isSerializableValue(value: unknown): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    isArray(value) ||
    isPlainObject(value)
  )
}
