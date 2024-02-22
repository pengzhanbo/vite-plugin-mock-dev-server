# 文件上传

文件上传接口在一般场景中是常见的需求。
通常通过 表单提交，或者 `FormData` 序列化请求体后Fetch， 实现上传文件到服务端。

如果是通过 表单提交，需要声明 `enctype="multipart/form-data"`, 如果是通过
`Fetch` 或 `ajax` 上传，需要声明 header `content-type` 为 `multipart/form-data`。

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

在本插件中， 通过 [`formidable`](https://www.npmjs.com/package/formidable) 对 `content-type`为
`multipart/form-data` 的请求进行解析处理。

在表单提交的数据字段中，如 表单字段 `files`, 解析后为 `formidable.File` 的对象类型，可用于获取上传的资源文件的相关信息：

如果 声明了 `multiple` 属性，则对应字段解析为  `formidable.File[]` 的数组。

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

在mock 配置文件中, 可直接通过 `req.body.*` 获取相关的信息：
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
