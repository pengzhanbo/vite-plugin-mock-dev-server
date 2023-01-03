import bodyParser from 'co-body'
import type { Connect } from 'vite'

export async function parseReqBody(req: Connect.IncomingMessage): Promise<any> {
  const method = req.method!.toUpperCase()
  if (['GET', 'DELETE', 'HEAD'].includes(method)) return undefined
  const type = req.headers['content-type']
  if (type === 'application/json') {
    return await bodyParser.json(req)
  }
  if (type === 'application/x-www-form-urlencoded') {
    return await bodyParser.form(req)
  }
  if (type === 'text/plain') {
    return await bodyParser.text(req)
  }
  return undefined
}
