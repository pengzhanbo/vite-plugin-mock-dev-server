/// <reference types="vite/client" />

declare const __IS_DEVELOPMENT__: boolean

declare module '*.css' {
  const content: string
  export default content
}

declare module 'mockjs' {
  const mockjs: any

  export default mockjs
}
