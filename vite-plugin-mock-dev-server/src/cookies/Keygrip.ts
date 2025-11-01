import crypto from 'node:crypto'
import { timeSafeCompare } from './timeSafeCompare'

const SLASH_PATTERN = /[/+=]/g
const REPLACE_MAP: Record<string, string> = { '/': '_', '+': '-', '=': '' }

export class Keygrip {
  private algorithm!: string
  private encoding!: crypto.BinaryToTextEncoding
  private keys: string[] = []

  constructor(keys: string[], algorithm?: string, encoding?: crypto.BinaryToTextEncoding) {
    this.keys = keys
    this.algorithm = algorithm || 'sha256'
    this.encoding = encoding || 'base64'
  }

  sign(data: string, key: string = this.keys[0]): string {
    return crypto.createHmac(this.algorithm, key).update(data).digest(this.encoding).replace(SLASH_PATTERN, m => REPLACE_MAP[m])
  }

  index(data: string, digest: string): number {
    for (let i = 0, l = this.keys.length; i < l; i++) {
      if (timeSafeCompare(digest, this.sign(data, this.keys[i]))) {
        return i
      }
    }

    return -1
  }

  verify(data: string, digest: string): boolean {
    return this.index(data, digest) > -1
  }
}
