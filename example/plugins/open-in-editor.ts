import type { Plugin } from 'vite'
import launchEditor from 'launch-editor'

/**
 * Open a mock file in the local editor.
 *
 * `X-File-Path` is emitted by the mock plugin for every matched rule, so the UI can
 * link a response back to the exact mock file. `launch-editor` reuses the editor
 * detected by the terminal (VS Code, Cursor, WebStorm, ...), which is more portable
 * than hardcoding a `vscode://` URL. The file is passed relative to the IDE
 * workspace whenever possible; some editors cannot resolve absolute paths outside
 * their workspace context.
 *
 * 在本地编辑器中打开 mock 文件。
 *
 * mock 插件会为每个命中的规则响应 `X-File-Path`，UI 因此可以把响应关联回具体的
 * mock 文件。`launch-editor` 会复用终端检测到的编辑器（VS Code、Cursor、WebStorm 等），
 * 比硬编码 `vscode://` 链接更通用。只要可能，文件会以 IDE 工作区相对路径传入；
 * 某些编辑器无法解析工作区上下文之外的绝对路径。
 *
 * @returns Vite plugin / Vite 插件
 */
export function openInEditor(): Plugin {
  return {
    name: 'example-open-in-editor',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__open-in-editor', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const file = url.searchParams.get('file')

        if (!file) {
          res.statusCode = 400
          res.end('A file path is required')
          return
        }

        try {
          launchEditor(file, (fileName, errorMessage) => {
            if (errorMessage) {
              server.config.logger.warn(`[open-in-editor] ${fileName}: ${errorMessage}`)
            }
          })
          res.statusCode = 202
          res.end()
        } catch (error) {
          res.statusCode = 500
          res.end((error as Error).message)
        }
      })
    },
  }
}
