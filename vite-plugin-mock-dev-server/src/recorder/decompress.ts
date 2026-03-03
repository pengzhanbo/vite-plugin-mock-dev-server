import type { LiteralUnion } from '@pengzhanbo/utils'
import type { ZstdStreaming } from 'zstd-codec'
import zlib from 'node:zlib'

type SUPPORT_ENCODING
  = | 'identity'
    | 'gzip' | 'x-gzip'
    | 'deflate' | 'x-deflate'
    | 'br'
    | 'zstd'

/**
 * Decode response body according to encoding
 *
 * 根据编码解码响应体
 *
 * @param rawBody 原始响应体
 * @param encoding 编码
 * @returns 解码后的响应体
 */
export async function decompressBody(
  rawBody: Uint8Array,
  encoding: LiteralUnion<SUPPORT_ENCODING>,
): Promise<{ body: Uint8Array, encoding: LiteralUnion<SUPPORT_ENCODING> }> {
  try {
    switch (encoding.toLowerCase()) {
      case 'gzip':
      case 'x-gzip':
        return { body: await gunzip(rawBody), encoding: 'identity' }
      case 'deflate':
      case 'x-deflate':
        return { body: await deflate(rawBody), encoding: 'identity' }
      case 'br':
        return { body: await brotli(rawBody), encoding: 'identity' }
      case 'zstd':
        return { body: await zstd(rawBody), encoding: 'identity' }
    }
  }
  catch {}
  return { body: rawBody, encoding }
}

let zstdStreaming: ZstdStreaming | null = null
/**
 * Decompress zstd compressed data
 *
 * 解压缩 zstd 压缩数据
 *
 * zlib.zstdDecompress 从 v22.15.0 开始支持，对于旧版本 Node.js 可以使用 zstd-codec 库
 *
 * @param rawBody 压缩数据
 * @returns 解压缩后的数据
 */
async function zstd(rawBody: Uint8Array): Promise<Uint8Array> {
  if (zlib.zstdDecompress) {
    return new Promise((resolve, reject) => {
      zlib.zstdDecompress(rawBody, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
  if (!zstdStreaming) {
    const { ZstdCodec } = await import('zstd-codec')
    zstdStreaming = await (new Promise((resolve) => {
      ZstdCodec.run((binding) => {
        resolve(new binding.Streaming())
      })
    }))
  }

  return zstdStreaming!.decompress(rawBody, rawBody.length)
}

/**
 * Decompress brotli compressed data
 *
 * 解压缩 brotli 压缩数据
 *
 * @param rawBody 压缩数据
 * @returns 解压缩后的数据
 */
async function brotli(rawBody: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zlib.brotliDecompress(rawBody, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

async function gunzip(rawBody: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zlib.gunzip(rawBody, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

async function deflate(rawBody: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zlib.inflate(rawBody, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}
