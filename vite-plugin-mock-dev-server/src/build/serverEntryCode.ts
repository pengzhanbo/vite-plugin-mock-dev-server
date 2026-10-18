import type formidable from 'formidable'
import type { ResolvedMockServerPluginOptions } from '../core/options.js'
import type { ServerBuildOption } from '../types/index.js'
import path from 'node:path'
import { isArray, isPlainObject } from '@pengzhanbo/utils'
import ansis from 'ansis'

/**
 * formidable 接收的上传目录配置键，`uploaddir` 为其历史别名
 *
 * The option keys accepted by formidable for the upload directory,
 * `uploaddir` is its legacy alias
 */
const UPLOAD_DIR_KEYS = ['uploadDir', 'uploaddir']

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
  cwd,
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

  // 用户配置的 uploadDir 是紧贴本地机器的路径（通常由 `process.cwd()` 拼接而来，属于绝对路径），
  // 直接序列化到产物中，会让独立 mock server 在部署机器上把上传文件写入产物目录之外的位置
  // （若该路径不存在，则会静默写入失败）。因此仅在用户配置了 uploadDir 时，构建期将其
  // 重定位到产物目录下的同名目录，并输出构建期提示；生成代码在启动时创建该目录。
  const serializableCors = resolveSerializableCors(cors, logger)

  const configuredUploadDir = pickUploadDir(formidableOptions)
  const uploadDirName = resolveUploadDirName(configuredUploadDir, cwd)
  if (configuredUploadDir && uploadDirName) {
    logger.warn(
      `The ${ansis.bold('formidableOptions.uploadDir')} (${ansis.yellow(configuredUploadDir)}) is not portable to the generated mock server, it has been relocated to ${ansis.green(`./${uploadDirName}`)} in the output directory and will be created when the server starts.`,
    )
  }

  // 仅在用户配置了 uploadDir 时，产物才引入相关内置模块并生成创建目录的代码
  const nodeImports = uploadDirName
    ? `import fs from 'node:fs';\nimport os from 'node:os';\nimport path from 'node:path';\n`
    : ''

  const uploadDirCode = uploadDirName
    ? `\nconst uploadDir = path.resolve(import.meta.dirname, ${JSON.stringify(uploadDirName)});
try {
  fs.mkdirSync(uploadDir, { recursive: true });
  formidableOptions.uploadDir = uploadDir;
} catch (error) {
  logger.error(\`Failed to create the upload directory \${uploadDir}, fallback to the OS temp directory: \${error}\`);
  formidableOptions.uploadDir = os.tmpdir();
}\n
`
    : ''

  return `import { createServer } from 'node:http';
${nodeImports}import process from 'node:process';
import connect from 'connect';
import { createMockMiddleware, createLogger, createMatchingWeightSorter, mockWebSocket } from 'vite-plugin-mock-dev-server/server';
import mockData from './mock-data.js';

const app = connect();
const server = createServer(app);
const logger = createLogger('mock-server', ${JSON.stringify(log)});
const proxies = ${JSON.stringify(proxies)};
const wsProxies = ${JSON.stringify(wsProxies)};
const cookiesOptions = ${JSON.stringify(cookiesOptions)};
const bodyParserOptions = ${JSON.stringify(bodyParserOptions)};
const priority = ${JSON.stringify(priority)};
const cors = ${JSON.stringify(serializableCors)};
const activeScene = ${JSON.stringify(activeScene)};
const formidableOptions = ${JSON.stringify(serializableFormidableOptions)};
${uploadDirCode}const record = {
  enabled: ${record.enabled ? 'true' : 'false'},
  cwd: process.cwd(),
  dir: ${JSON.stringify(record.dir)},
  expires: ${record.expires === Number.MAX_SAFE_INTEGER ? 'Number.MAX_SAFE_INTEGER' : record.expires},
  status: ${JSON.stringify(record.status)},
};

const compiler = { mockData }
const sortMockUrls = createMatchingWeightSorter()

mockWebSocket(compiler, server, { wsProxies, cookiesOptions, logger, activeScene, priority });

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
}, sortMockUrls));

const envPort = Number(process.env.PORT);
const port = Number.isInteger(envPort) && envPort > 0 ? envPort : ${serverPort};
const host = process.env.HOST || undefined;

// 端口占用等启动错误不应变成未捕获异常，否则产物进程会以一段堆栈直接退出
// Startup errors (such as a port already in use) must not become uncaught exceptions
server.on('error', (error) => {
  logger.error(\`Failed to start the mock server on \${host ?? '0.0.0.0'}:\${port}: \${error}\`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(\`listen: http://\${host ?? 'localhost'}:\${port}\`);
});
`
}

/**
 * 解析可以序列化到产物中的 cors 配置
 *
 * `cors` 允许 RegExp / function 形式的配置（如 `origin`），它们无法被 `JSON.stringify`
 * 序列化：直接序列化会变成 `{}`，等价于「允许所有来源」，且没有任何提示。
 * 这类配置会在构建期被忽略并输出警告，避免产物行为静默偏离用户配置。
 *
 * @param cors - Resolved cors options / 解析后的 cors 配置
 * @param logger - Logger instance / 日志实例
 * @returns The value serialized into the generated server / 写入产物的值
 */
function resolveSerializableCors(
  cors: ResolvedMockServerPluginOptions['cors'],
  logger: ResolvedMockServerPluginOptions['logger'],
): false | Record<string, unknown> {
  if (cors === false) {
    return false
  }

  const { value, unsupportedKeys } = pickSerializableOptions(cors)
  if (unsupportedKeys.length) {
    const hint = unsupportedKeys.includes('origin')
      ? `\n  Without ${ansis.bold('cors.origin')} the generated server allows ${ansis.yellow('all origins')}, use a string origin to keep the restriction.`
      : ''
    logger.warn(
      `The following ${ansis.bold('cors')} options cannot be serialized and will be ignored in the generated mock server: ${unsupportedKeys
        .map((key) => ansis.yellow(`cors.${key}`))
        .join(', ')}.${hint}`,
    )
  }
  return value
}

/**
 * 提取可序列化的 formidable 配置项
 *
 * `formidableOptions` 支持 function 类型的配置项（如 `filter`、`filename`），
 * 它们无法被序列化到生成的代码中，这类配置项会被忽略，并在构建期输出警告。
 *
 * `uploadDir`（`uploaddir`）不具备可移植性，这里会被排除，
 * 并交由 `generatorServerEntryCode` 重定位到产物目录内。
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
    if (value == null || UPLOAD_DIR_KEYS.includes(key)) {
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
 * Read the upload directory configured by the user
 *
 * 读取用户配置的上传目录
 *
 * @param options - Formidable options / formidable 配置项
 * @returns The configured upload directory / 用户配置的上传目录
 */
function pickUploadDir(options: formidable.Options): string | undefined {
  const entry = Object.entries(options).find(([key]) => UPLOAD_DIR_KEYS.includes(key))
  return typeof entry?.[1] === 'string' && entry[1] ? entry[1] : undefined
}

/**
 * 解析生成产物中重定位后的上传目录名
 *
 * 仅保留用户配置路径的最后一段目录名，产物中该目录始终位于产物目录之下，
 * 因此不同机器上的绝对路径前缀不会泄漏到产物中。
 *
 * @param uploadDir - Configured upload directory / 用户配置的上传目录
 * @param cwd - Build working directory / 构建工作目录
 * @returns Relocated directory name or undefined / 重定位后的目录名或 undefined
 */
function resolveUploadDirName(uploadDir: string | undefined, cwd: string): string | undefined {
  if (!uploadDir) {
    return undefined
  }
  // 目录名非法（如配置为根路径）时回退为 `uploads`
  // Fallback to `uploads` when the directory name is invalid (such as a root path)
  const name = path.basename(path.resolve(cwd, uploadDir))
  return name && name !== '.' && name !== '..' ? name : 'uploads'
}

/**
 * 提取配置对象中可被序列化的配置项
 *
 * 不可序列化的值（function / RegExp / Date 等）会被忽略，其键会一并返回，
 * 由调用方在构建期输出警告。
 *
 * @param options - Options object / 配置对象
 * @returns Serializable options with the unsupported keys / 可序列化的配置项与不支持的键
 */
function pickSerializableOptions(options: object): {
  value: Record<string, unknown>
  unsupportedKeys: string[]
} {
  const value: Record<string, unknown> = {}
  const unsupportedKeys: string[] = []

  for (const [key, item] of Object.entries(options)) {
    if (item == null) {
      continue
    }
    if (isSerializableValue(item)) {
      value[key] = item
    } else {
      unsupportedKeys.push(key)
    }
  }

  return { value, unsupportedKeys }
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
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true
  }
  // 递归检查数组与普通对象，避免 `origin: ['http://a', /regex/]` 这类配置被部分序列化
  if (isArray(value)) {
    return value.every((item) => item == null || isSerializableValue(item))
  }
  if (isPlainObject(value)) {
    return Object.values(value).every((item) => item == null || isSerializableValue(item))
  }
  return false
}
