import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button.js'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field.js'
import { Input } from '@/components/ui/input.js'
import { Spinner } from '@/components/ui/spinner.js'

/**
 * Multipart upload panel
 *
 * multipart 上传面板
 *
 * @returns Upload panel content / 上传面板内容
 */
export function UploadPanel(): React.ReactNode {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('mark')
  const [result, setResult] = useState('')
  const [uploading, setUploading] = useState(false)

  const submit = async (): Promise<void> => {
    const data = new FormData()
    for (const file of fileRef.current?.files ?? []) {
      data.append('files', file)
    }
    data.append('name', name)
    setUploading(true)
    setResult('uploading…')
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: data })
      const text = await response.text()
      setResult(`${response.status} ${response.statusText}\n\n${text}`)
    } catch (error) {
      setResult((error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldGroup className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="upload-files">Files</FieldLabel>
          <Input ref={fileRef} id="upload-files" type="file" name="files" multiple />
        </Field>
        <Field>
          <FieldLabel htmlFor="upload-name">Name</FieldLabel>
          <Input id="upload-name" value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
      </FieldGroup>
      <Button size="sm" disabled={uploading} onClick={() => void submit()}>
        {uploading ? <Spinner data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
        {uploading ? 'Uploading…' : 'Upload'}
      </Button>
      {result && (
        <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-muted/35 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {result}
        </pre>
      )}
    </div>
  )
}
