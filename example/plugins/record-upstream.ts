/**
 * A tiny upstream service for the record / replay scenario.
 *
 * The plugin only records responses that are forwarded through Vite's proxy, so the
 * example needs a real upstream to demonstrate the feature. It starts together with
 * the dev server and is closed when the server closes.
 *
 * 录制 / 回放场景使用的微型上游服务。
 *
 * 插件只会录制经由 Vite 代理转发的响应，因此示例需要一个真实的上游服务来演示该能力。
 * 它随开发服务器一起启动，并在服务器关闭时关闭。
 */
import type { Plugin } from 'vite'
import { createServer } from 'node:http'

/**
 * Create the upstream plugin
 *
 * 创建上游服务插件
 *
 * @param port - Listening port / 监听端口
 * @returns Vite plugin / Vite 插件
 */
export function recordUpstream(port: number): Plugin {
  let upstream: ReturnType<typeof createServer> | undefined
  let sequence = 0

  return {
    name: 'example:record-upstream',
    apply: 'serve',
    async configureServer(server) {
      upstream = createServer((req, res) => {
        sequence += 1
        const url = new URL(req.url ?? '/', 'http://localhost')
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'x-upstream': 'example-record-upstream',
        })
        res.end(
          JSON.stringify({
            source: 'upstream',
            sequence,
            token: url.searchParams.get('token'),
            pathname: url.pathname,
            receivedAt: new Date().toISOString(),
          }),
        )
      })

      await new Promise<void>((resolve, reject) => {
        upstream!.once('error', reject)
        upstream!.listen(port, '127.0.0.1', () => {
          upstream!.off('error', reject)
          resolve()
        })
      })

      server.httpServer?.once('close', () => upstream?.close())
    },
  }
}
