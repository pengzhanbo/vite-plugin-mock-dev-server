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
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    fs.writeFileSync(filepath, '{invalid json', 'utf-8')

    await expect(readRecordStorage(filepath)).resolves.toEqual([])
    expect(error).toHaveBeenCalled()

    error.mockRestore()
  })
})
