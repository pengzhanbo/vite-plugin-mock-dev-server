import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const deprecatedContent = `The CJS build of vite-plugin-mock-dev-server's Node API is deprecated. See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.`

async function rewriteCjsDts() {
  const filepath = path.join(process.cwd(), 'dist', 'index.d.cts')
  let content = fs.readFileSync(filepath, 'utf-8')
  content = content.replace('declare function mockDevServerPlugin(', `/** @deprecated ${deprecatedContent} */\ndeclare function mockDevServerPlugin(`)

  await fs.promises.writeFile(filepath, content, 'utf-8')
}

async function rewriteCjs() {
  const filepath = path.join(process.cwd(), 'dist', 'index.cjs')
  let content = fs.readFileSync(filepath, 'utf-8')
  content += `\nwarnCjsUsage()\nfunction warnCjsUsage() {
  if (process.env.VITE_CJS_IGNORE_WARNING) return
  const yellow = (str) => \`\\u001b[33m\${str}\\u001b[39m\`
  const log = process.env.VITE_CJS_TRACE ? console.trace : console.warn
  log(
    yellow(
      \`${deprecatedContent}\`,
    ),
  )
}\n`

  await fs.promises.writeFile(filepath, content, 'utf-8')
}

async function rewrite() {
  await rewriteCjs()
  await rewriteCjsDts()
}

rewrite().catch(e => console.error(e))
