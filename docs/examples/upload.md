# 文件上传

表单上传文件

```html
<form action="/api/upload" method="post" enctype="multipart/form-data">
    <p>
      <span>file: </span>
      <input type="file" name="files" multiple />
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
