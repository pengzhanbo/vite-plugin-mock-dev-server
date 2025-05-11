# File Upload

Form Upload File

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <p>
    <span>file: </span>
    <input type="file" name="files" multiple>
  </p>
  <p>
    <span>name:</span>
    <input type="text" name="name" value="mark">
  </p>
  <p>
    <input type="submit" value="submit">
  </p>
</form>
```

::: code-group

```ts [upload.mock.ts]
export default defineMock({
  url: '/api/upload',
  method: 'POST',
  body(req) {
    const body = req.body
    return {
      name: body.name,
      files: body.files.map((file: any) => file.originalFilename),
    }
  },
})
```

:::

## File Download

Simulate file download, pass in file read stream

```ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // When you are unsure of the type, you can pass the file name for internal parsing by the plugin
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg')
})
```

```html
<a href="/api/download" download="my-app.dmg">Download</a>
```
