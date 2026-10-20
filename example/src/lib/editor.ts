/**
 * Open a local file in the editor detected by the dev server.
 *
 * The example plugin `/__open-in-editor` delegates to `launch-editor`, so VS Code,
 * Cursor, WebStorm and other supported editors work without hardcoding a URL scheme.
 *
 * 在开发服务器检测到的编辑器中打开本地文件。
 *
 * 示例插件 `/__open-in-editor` 使用 `launch-editor`，无需硬编码 URL scheme，
 * VS Code、Cursor、WebStorm 等受支持的编辑器都可以直接打开。
 *
 * @param file - Absolute file path / 绝对文件路径
 * @param line - Line number / 行号
 * @param column - Column number / 列号
 * @returns Promise resolved when the request is accepted / 请求被接受时 resolve
 */
export async function openInEditor(file: string, line = 1, column = 1): Promise<void> {
  const query = new URLSearchParams({
    file,
    line: String(line),
    column: String(column),
  })
  const response = await fetch(`/__open-in-editor?${query}`)
  if (!response.ok) {
    throw new Error((await response.text()) || `HTTP ${response.status}`)
  }
}
