## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error [#17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/17) ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


### Performance Improvements

* optimize types declaration ([ba948ed](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ba948ed833ce5b98b57ad3b644eafb79b52c5be8))



## [0.4.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.1...v0.4.2) (2023-02-23)


### Bug Fixes

* HMR failure caused by `posix` in windows ([7dda6fc](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/7dda6fc753f40923f25fac2811f33743203ecbe5))
* HMR failure caused by `posix` in windows ([607e5cb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/607e5cba0c8382eb5391bb7f61f77b62c89dd40a))



## [0.4.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.0...v0.4.1) (2023-02-23)


### Bug Fixes

* modified `content-type` match error ([16d55ed](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/16d55eddec77438ec232a051f12ad6125260a666))


### Features

* add `cache-control` header to clear cache ([5a8ce24](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a8ce24f02171b037f48a24b826fda2c7479d74e))



# [0.4.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.21...v0.4.0) (2023-02-20)


### Features

* add automatic statusText  acquisition ([7d190c2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/7d190c2a0595ce8288e71c2992ff3a76bc6ad01f))



## [0.3.21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.20...v0.3.21) (2023-02-15)


### Bug Fixes

* **build:** empty-import-meta warning ([#13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/13)) ([3a8e854](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3a8e854e06a40273d54d78f3140395adb2e5b731))
* TS6307: File '/xxx/vite-plugin-mock-dev-server/package.json' is not listed within the file list of project '/xxx/vite-plugin-mock-dev-server/tsconfig.esm.json'. Projects must list all files or use an 'include' pattern. ([8a4ae76](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8a4ae762728162fb988ec7f431f393944842063f))


### Features

* **validator:** supports referer query ([a11db47](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a11db47eced4668ffc606abc6e491d5365ef65cd))



## [0.3.20](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.19...v0.3.20) (2023-02-08)


### Features

* add `prefix` options ([6682e0e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6682e0e117479293f05896f8fb60cced60e8d8c9))



## [0.3.19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.18...v0.3.19) (2023-02-07)


### Bug Fixes

* **build:**  hot update ([#9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/9)) ([0564210](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0564210238590e5656e20aaf173c9d7eea4f0630))
* **middleware:** hot update failure ([4394a43](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/4394a43b0ea8ca28aa667121724f8bd22063ce5e))



## [0.3.18](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.17...v0.3.18) (2023-02-03)


### Bug Fixes

* **build:** entryCode `formidableOptions` options ([38c8fe9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/38c8fe968a7754277dc38693662080ea7872e7c8))
* **build:** exclude node modules ([fd5b823](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fd5b8230ce427c39cdb4ca250e1d3ef52ebd5208))



## <small>0.3.17 (2023-02-02)</small>

* feat: add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a3))
* feat: add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f))
* docs(readme):  add mock-services ([824afe6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/824afe6))
* docs(vitepress): add mock server doc ([deca4f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/deca4f1))
* ci: fix release workflow ([ff66c21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ff66c21))



## [0.3.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.15...v0.3.16) (2023-01-28)


### Performance Improvements

* optimize matching  and  `validator` priority ([72cb7e7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72cb7e7ff2c1f2948ccb945e54131ba16e51c803))



## [0.3.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.14...v0.3.15) (2023-01-07)



## [0.3.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.13...v0.3.14) (2023-01-06)


### Bug Fixes

* remove cypress from the exclude list ([#4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/4)) ([0e0f2d9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0e0f2d9f7ddbe80223d1e91c7827f9adadec913b))



## [0.3.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.12...v0.3.13) (2023-01-04)


### Bug Fixes

* degraded formidable v2 to support cjs&esm ([ffe0a8b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ffe0a8bf9b9e95993ffb4ba7bad69d1ac7d40a67))



## [0.3.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.11...v0.3.12) (2023-01-03)


### Bug Fixes

* tryCatch parseReqBody ([c05eadd](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c05eadde406e75a46af6725e537f89400902d18d))



## [0.3.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.10...v0.3.11) (2023-01-03)


### Features

* support multipart ([8b2f2db](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8b2f2db32825733170718685aa9dc08637831480))



## [0.3.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.9...v0.3.10) (2023-01-03)


### Features

* support multipart content-type ([ed1fdc0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ed1fdc087017b82a670b1e568f1a54454b5dae18))



## [0.3.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.8...v0.3.9) (2023-01-03)


### Bug Fixes

* **parseReqBody:** no parsed unknown content-type ([82c889a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/82c889a6d55b7ba8d7057ac33012de87b71de8e7))



## [0.3.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.7...v0.3.8) (2023-01-03)



## [0.3.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.6...v0.3.7) (2023-01-03)


### Bug Fixes

* **MockLoader:** Expected value for define "xxx" to be a string, got boolean instead ([37bd890](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/37bd890203e5fec68e0695756e8956d65c71b050))



## [0.3.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.5...v0.3.6) (2022-12-21)



## [0.3.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.4...v0.3.5) (2022-12-15)


### Bug Fixes

* 修复 cjs下 importMetaUrl 取值为空 ([327ee52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/327ee525a097f4a4014e09f93e9f28610e1da8ba))



## [0.3.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.3...v0.3.4) (2022-12-14)



## [0.3.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.2...v0.3.3) (2022-12-14)


### Bug Fixes

* deps watch ([9b77a01](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9b77a011abb11a9e177bd9c363b84bc8174430c7))



## [0.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.1...v0.3.2) (2022-11-18)



## [0.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.0...v0.3.1) (2022-11-18)


### Features

* overload defineMock ([e98d665](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e98d665954a024cbb54da41a9b5a6ec01d08ae84))



# [0.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.2.3...v0.3.0) (2022-11-10)


### Bug Fixes

* esm tsconfig ([f0412c5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f0412c5975a3ce0432914e5010bf528f7d970e7f))


### Features

* 优化mock模块加载逻辑 ([ba53aea](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ba53aea26899e8ace19d5d30dbdee3c71eda88a2))



## [0.2.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.2.2...v0.2.3) (2022-11-03)


### Features

* 添加 json/json5 文件支持 ([ecb9e8a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecb9e8a041261e58ba4213199638dc540ca2170e))



## [0.2.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.2.1...v0.2.2) (2022-11-03)


### Features

* 更新插件执行时机 ([de2b56f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/de2b56f7edc3bccf6924a5c23bc8ceac3730c5da))



## [0.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.2.0...v0.2.1) (2022-11-02)



# [0.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.1.1...v0.2.0) (2022-11-02)


### Bug Fixes

* 修复mock deps 监听不正确 ([b6a456e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b6a456e397007c5b8ae987ca14811bc536a7f5a7))


### Features

* 补充示例，更新readme ([51679e7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51679e787372ba36c2f7172a54ed2b9d0448f2df))
* 添加 options.exclude ([b9f47bc](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b9f47bcc935484b7f7cc94a279511c6dec0e40a2))
* 重构文件监听、文件构建 ([991e53c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/991e53cda60b3e85a916166e414405121c66ba88))



## [0.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.1.0...v0.1.1) (2022-11-01)


### Bug Fixes

* 修复mock文件无法正确引入外部模块 ([f44a9e0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f44a9e0d7e58f7b5e239d19a319b5079b98fa4f7))



# 0.1.0 (2022-10-30)



