import type { Connect } from 'vite'
import type { BodyParserOptions } from '../types'
import bodyParser from 'co-body'
import formidable from 'formidable'

const DEFAULT_FORMIDABLE_OPTIONS: formidable.Options = {
  keepExtensions: true,
  filename(name, ext, part) {
    return part?.originalFilename || `${name}.${Date.now()}${ext ? `.${ext}` : ''}`
  },
}

export async function parseReqBody(
  req: Connect.IncomingMessage,
  formidableOptions: formidable.Options,
  bodyParserOptions: BodyParserOptions = {},
): Promise<any> {
  const method = req.method!.toUpperCase()
  if (['HEAD', 'OPTIONS'].includes(method))
    return undefined
  const type = req.headers['content-type']?.toLocaleLowerCase() || ''
  const { limit, formLimit, jsonLimit, textLimit, ...rest } = bodyParserOptions
  try {
    if (type.startsWith('application/json')) {
      return await bodyParser.json(req, {
        limit: jsonLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('application/x-www-form-urlencoded')) {
      return await bodyParser.form(req, {
        limit: formLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('text/plain')) {
      return await bodyParser.text(req, {
        limit: textLimit || limit,
        ...rest,
      })
    }

    if (type.startsWith('multipart/form-data'))
      return await parseMultipart(req, formidableOptions)
  }
  catch (e) {
    console.error(e)
  }
  return undefined
}

async function parseMultipart(
  req: Connect.IncomingMessage,
  options: formidable.Options,
): Promise<any> {
  const form = formidable({ ...DEFAULT_FORMIDABLE_OPTIONS, ...options })

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ ...fields, ...files })
    })
  })
}
