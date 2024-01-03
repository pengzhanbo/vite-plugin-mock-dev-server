## 文件上传

表单上传文件

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
  <p>
    <span>file: </span>
    <input type="file" name="files" multiple="multiple">
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

## 文件下载

模拟文件下载，传入文件读取流
```ts
import { createReadStream } from 'node:fs'

export default defineMock({
  url: '/api/download',
  // 当你不确定类型，可传入文件名由插件内部进行解析
  type: 'my-app.dmg',
  body: () => createReadStream('./my-app.dmg')
})
```

```html
<a href="/api/download" download="my-app.dmg">下载文件</a>
```
