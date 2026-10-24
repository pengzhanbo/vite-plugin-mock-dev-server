/**
 * Test for the recorder storage cache
 *
 * 录制存储缓存测试
 */
import type { RecordedRequest } from '../src/types/index.js'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readRecordStorage, writeRecordStorage } from '../src/recorder/storage.js'

/**
 * Create a logger whose output can be asserted
 *
 * 创建可断言输出的日志实例
 *
 * @returns Mock logger / 模拟日志实例
 */
function createMockLogger() {
  return { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}

/**
 * Create a recorded request
 *
 * 构造一条录制数据
 *
 * @param pathname - Request pathname / 请求路径
 * @returns Recorded request / 录制数据
 */
function createRecord(pathname: string): RecordedRequest {
  return {
    meta: {
      timestamp: 1,
      createAt: '1970-01-01T00:00:00.000Z',
      filepath: `${pathname}.json`,
    },
    req: { method: 'GET', pathname, query: {}, body: null, bodyType: 'none' },
    res: { status: 200, statusText: 'OK', headers: {}, body: `body of ${pathname}` },
  }
}

describe('recorder storage', () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-record-'))
  })

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('should return an empty array when the file does not exist', async () => {
    await expect(readRecordStorage(path.join(dir, 'missing.json'))).resolves.toEqual([])
  })

  it('should read and cache the records of a file', async () => {
    const filepath = path.join(dir, 'api-users.json')
    await writeRecordStorage(filepath, [createRecord('/api/users')])

    const first = await readRecordStorage(filepath)
    expect(first).toHaveLength(1)
    expect(first[0].req.pathname).toBe('/api/users')

    // 命中缓存时返回同一个引用
    // The same reference is returned on a cache hit
    expect(await readRecordStorage(filepath)).toBe(first)
  })

  it('should pick up external changes of the file', async () => {
    const filepath = path.join(dir, 'api-users.json')
    await writeRecordStorage(filepath, [createRecord('/api/users')])
    expect(await readRecordStorage(filepath)).toHaveLength(1)

    // 外部修改记录文件后应重新读取，而不是继续使用旧缓存
    // The records should be reloaded instead of using the stale cache
    fs.writeFileSync(
      filepath,
      JSON.stringify([createRecord('/api/users'), createRecord('/api/users')]),
      'utf-8',
    )
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(await readRecordStorage(filepath)).toHaveLength(2)
  })

  it('should pick up a file replaced with the same size and modification time', async () => {
    const filepath = path.join(dir, 'api-users.json')
    // `/api/aaaa` 与 `/api/bbbb` 长度相同，生成的 JSON 文件大小也相同
    // `/api/aaaa` and `/api/bbbb` have the same length, so do the generated JSON files
    await writeRecordStorage(filepath, [createRecord('/api/aaaa')])
    const { mtimeMs, size } = fs.statSync(filepath)
    expect(await readRecordStorage(filepath)).toHaveLength(1)

    fs.writeFileSync(filepath, JSON.stringify([createRecord('/api/bbbb')], null, 2), 'utf-8')
    // 保留原有的修改时间，模拟 `cp -p` / 解压覆盖等场景
    // Restore the original modification time to mimic `cp -p` or extracting an archive
    fs.utimesSync(filepath, mtimeMs / 1000, mtimeMs / 1000)

    const stats = fs.statSync(filepath)
    expect(stats.size).toBe(size)
    expect(stats.mtimeMs).toBe(mtimeMs)

    // 仅比较 `size` 与 `mtimeMs` 无法识别文件被替换，必须依赖 `ctime` / `ino` 等身份信息
    // Comparing only `size` and `mtimeMs` cannot detect the replacement, the file
    // identity (`ctime` / `ino`) is required
    const records = await readRecordStorage(filepath)
    expect(records).toHaveLength(1)
    expect(records[0].req.pathname).toBe('/api/bbbb')
  })

  it('should invalidate the cache after the file is deleted', async () => {
    const filepath = path.join(dir, 'api-users.json')
    await writeRecordStorage(filepath, [createRecord('/api/users')])
    expect(await readRecordStorage(filepath)).toHaveLength(1)

    fs.rmSync(filepath)
    expect(await readRecordStorage(filepath)).toEqual([])
  })

  it('should read the latest data after writing', async () => {
    const filepath = path.join(dir, 'api-users.json')
    await writeRecordStorage(filepath, [createRecord('/api/users')])
    await writeRecordStorage(filepath, [createRecord('/api/users'), createRecord('/api/users')])

    expect(await readRecordStorage(filepath)).toHaveLength(2)
  })

  it('should return an empty array when the file content is invalid', async () => {
    const filepath = path.join(dir, 'api-users.json')
    const logger = createMockLogger()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    fs.writeFileSync(filepath, '{invalid json', 'utf-8')

    await expect(readRecordStorage(filepath, logger)).resolves.toEqual([])

    // 存储错误统一走插件 logger，不再绕过它直接打印
    // Storage failures go through the plugin logger instead of being printed directly
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error.mock.calls[0][0]).toContain('Failed to read the record file')
    expect(consoleError).not.toHaveBeenCalled()

    consoleError.mockRestore()
  })

  it('should log through the logger when writing fails', async () => {
    const logger = createMockLogger()
    // 以文件作为目录的父级，写入时 `mkdir` 会以 ENOTDIR 失败
    // Using a file as the parent directory makes `mkdir` fail with ENOTDIR
    const blocker = path.join(dir, 'blocker')
    fs.writeFileSync(blocker, 'not a directory', 'utf-8')

    await expect(
      writeRecordStorage(path.join(blocker, 'record.json'), [createRecord('/api/users')], logger),
    ).resolves.toBeUndefined()

    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error.mock.calls[0][0]).toContain('Failed to write the record file')
  })
})
