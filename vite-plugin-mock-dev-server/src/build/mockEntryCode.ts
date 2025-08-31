import path from 'node:path'
import { glob } from 'tinyglobby'
import { createMatcher, normalizePath } from '../utils'

export async function generateMockEntryCode(
  cwd: string,
  dir: string,
  include: string[],
  exclude: string[],
) {
  const { pattern, ignore } = createMatcher(include, exclude)
  const mockFiles = await glob(pattern, { ignore, cwd: path.join(cwd, dir) })

  let importers = ''
  const exporters: string[] = []
  mockFiles.forEach((filepath, index) => {
    // fix: #21
    const file = normalizePath(path.join(cwd, dir, filepath))
    importers += `import * as m${index} from '${file}';\n`
    exporters.push(`[m${index}, '${normalizePath(path.join(dir, filepath))}']`)
  })
  return `import { processMockData, processRawData } from 'vite-plugin-mock-dev-server/server';
${importers}
const exporters = [\n  ${exporters.join(',\n  ')}\n];
const mockList = exporters.map(([mod, filepath]) => processRawData(mod.default || mod, filepath));
export default processMockData(mockList);`
}
