# File Upload

File upload interface is a common requirement in general scenarios.
Usually, files are uploaded to the server through form submission or by serializing the request body with `FormData` and using Fetch.

If using form submission, it is necessary to declare `enctype="multipart/form-data"`. If using Fetch or Ajax for upload, the `content-type` header should be set to `multipart/form-data`.

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="files" multiple>
  <input type="submit" value="submit">
</form>
```

```ts
const form = new FormData()
form.append('file', file)
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': '`multipart/form-data'
  },
  body: form
})
```

In this plugin, the `formidable` library is used to parse and handle requests with `content-type` set to `multipart/form-data`.

In the data fields of form submissions, such as the form field `files`, it is parsed as an object of type `formidable.File`, which can be used to obtain information about the uploaded resource files.

If the `multiple` attribute is declared, the corresponding field is parsed as an array of `formidable.File`.

::: code-group

```ts [formidable.File]
interface File {
  /**
   * The size of the uploaded file in bytes. If the file is still being uploaded (see `'fileBegin'`
   * event), this property says how many bytes of the file have been written to disk yet.
   */
  size: number

  /**
   * The path this file is being written to. You can modify this in the `'fileBegin'` event in case
   * you are unhappy with the way formidable generates a temporary path for your files.
   */
  filepath: string

  /**
   * The name this file had according to the uploading client.
   */
  originalFilename: string | null

  /**
   * Calculated based on options provided
   */
  newFilename: string

  /**
   * The mime type of this file, according to the uploading client.
   */
  mimetype: string | null

  /**
   * A Date object (or `null`) containing the time this file was last written to. Mostly here for
   * compatibility with the [W3C File API Draft](http://dev.w3.org/2006/webapi/FileAPI/).
   */
  mtime?: Date | null | undefined

  hashAlgorithm: false | 'sha1' | 'md5' | 'sha256'

  /**
   * If `options.hashAlgorithm` calculation was set, you can read the hex digest out of this var
   * (at the end it will be a string).
   */
  hash?: string | null

  /**
   * This method returns a JSON-representation of the file, allowing you to JSON.stringify() the
   * file which is useful for logging and responding to requests.
   *
   * @link https://github.com/node-formidable/formidable#filetojson
   */
  toJSON: () => FileJSON

  toString: () => string
}
```

:::

In the mock configuration file, you can directly access the relevant information using `req.body.*`:

```ts
export default defineMock({
  url: '/api/upload',
  method: 'POST',
  body(req) {
    const body = req.body
    return {
      files: body.files.map((file: any) => file.originalFilename),
    }
  },
})
```
