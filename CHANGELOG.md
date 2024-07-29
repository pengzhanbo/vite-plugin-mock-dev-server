## [1.6.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.6.0...v1.6.1) (2024-07-29)


### Bug Fixes

* no such file or directory with cwd option ([#88](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/88)) ([d22004b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d22004b35fa16cf8967febc032fa9e7ae91612f3))



# [1.6.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.5.1...v1.6.0) (2024-07-25)


### Features

* add plugin options `cwd` ([#83](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/83)) ([43cf97b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/43cf97bd3e452ebd0ac3d5a126f1d935edc36863))


### Performance Improvements

* update deps to latest ([#85](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/85)) ([e2db223](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e2db223db3d22d77cffc8515f2a3125d713ed0cd))



## [1.5.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.5.0...v1.5.1) (2024-06-30)


### Performance Improvements

* update deps to latest ([2d280f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/2d280f75501d89777b24d71c0f7dac9f9bb60c72))



# [1.5.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.7...v1.5.0) (2024-3-27)


### Features

* Add `bodyParserOptions` option for configuring `co-body` (close [#76](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/76)) ([23b4dff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/23b4dffd0506d0b3a509bf8fec8ab59b91e1c599))


### Performance Improvements

* prettier code ([c26fa08](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c26fa080220b672077c8ee36603dbe665a83dc40))
* update non-major deps to latest ([6fdab75](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6fdab75cd536fb6fe550d43b26cd5fde3c71ee0d))



## [1.4.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.6...v1.4.7) (2024-1-17)


### Bug Fixes

* Optimize no proxy configured, add wsPrefix check ([ec57504](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ec5750438a1c7304ca3be6ef6cef2e3ca39ba5ea))



## [1.4.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.5...v1.4.6) (2024-1-17)


### Bug Fixes

*  esbuild `define` deep stringify fail ([#71](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/71)) ([d0f51bc](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d0f51bcaa26924c572bc7f30664ba3b8d9d898ad))


### Performance Improvements

* constant variable provide check ([2af011c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/2af011ca26a64a7a4e2647cddf9bcaa1675168fc))
* optimize no proxy configured, add `wsPrefix` check ([f1acafd](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1acafdb6478020ebab9ffa322a1f9a20f7798e0))



## [1.4.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.3...v1.4.5) (2024-1-9)


### Features

* add logs when no proxy configured [#68](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/68) ([2986210](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/2986210d3e7adf29e1418c90bc42798c3773035d))


### Performance Improvements

* esbuild target `node>=16` ([b3f5ae9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3f5ae9c4c25c909c05a4bd393df3c5ce48043b5))
* update `cjs` deprecate info ([b98c133](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b98c133141aa099cace0a23125bbf8b11170a4c6))



## [1.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.2...v1.4.3) (2023-12-14)


### Bug Fixes

* file recursively generated in the absolute path fails ([#65](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/65)) ([cac1411](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/cac1411849a44f2dcb2d946262e3db0aef78a5f0))


### Performance Improvements

* replace package info ([bb38bbf](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/bb38bbfc4b8cf4762c57b48823372cd35c1b46ee))



## [1.4.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.1...v1.4.2) (2023-12-14)


### Bug Fixes

* remove optional deps and change to build-in ([#65](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/65)) ([c02e387](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c02e387b3f8e45ec78ba12675b76dcd0f07c4f45))


### Features

* add mockServer logLevel options ([#65](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/65)) ([eb95494](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb95494b9ba414bfe486b7469ae0d705af01c9c3))



## [1.4.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.4.0...v1.4.1) (2023-12-13)


### Bug Fixes

* mockServer build error ([#63](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/63)) ([58b8aae](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/58b8aae6d736628140b2bb2c24ebe496c4905af6))


### Features

* deprecate `cjs` ([25deb2e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/25deb2ea36aac38d74c81aa1faa3caa996ae3201))



# [1.4.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.4...v1.4.0) (2023-12-5)


### Features

* support `vite5` ([5028c7c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5028c7c04ccd30a3021b75be83fe9112abfe9ea6))



## [1.3.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.4-beta.1...v1.3.4) (2023-09-22)



## [1.3.4-beta.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.4-beta.0...v1.3.4-beta.1) (2023-09-22)


### Bug Fixes

* can't set headers after they are sent. ([027b1c3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/027b1c38ad1613bf2eb0d0201904b01e1af2f054))
* simplify judgment conditions ([6718002](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6718002a086099f0a72a4b9f28054eebab5cb0fa))
* user configuration execution time ([52c7d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/52c7d2de75365cc0b8d4a46941f5397777352e91))
* user configuration is preferred ([3050a00](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3050a008020b1739111bb0e9fbad02c0703d7593))



## [1.3.4-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.3...v1.3.4-beta.0) (2023-09-21)


### Bug Fixes

* clear request stream cache ([1ef33d5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ef33d5d7d47012999df6ab12f4aed0b0bae2d56))
* consumed request stream  causing proxy failure ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([dc1fa64](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/dc1fa64d4c605161d3988f7e4f277a846b787cb4))
* write request stream chunk to the buffer ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([1ffe73c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ffe73ce061489a4db887dd4a2205013bfbb20a4))



## [1.3.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.2...v1.3.3) (2023-09-11)


### Bug Fixes

* adjust priority of `/(.*)` and `/path/(.*)`([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([8f43318](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8f433183374a8814d1394442f5e117cdb8c28b57))



## [1.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.1...v1.3.2) (2023-09-11)


### Features

* add `debug` log type ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([a49bfe5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a49bfe5ca42daf4703ee12d1c2054b9775540bc9))
* add match the priority of the rule ([41f460c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/41f460cda88821e6756778e6969edefc2c41bcbc))
* add runtime matching info ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([f1a22a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1a22a3f2ff486a37bad5d31b4e470688370bc1c))
* customize the matching rule priority ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([5075716](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5075716e3288458164905a6c381c4dd57a9664a5))


### Performance Improvements

* match the priority of the rule ([3adc476](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3adc47607c08e589f327b89a9ed1788c50c158b7))



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.3.4-beta.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.4-beta.0...v1.3.4-beta.1) (2023-09-22)


### Bug Fixes

* can't set headers after they are sent. ([027b1c3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/027b1c38ad1613bf2eb0d0201904b01e1af2f054))
* simplify judgment conditions ([6718002](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6718002a086099f0a72a4b9f28054eebab5cb0fa))
* user configuration execution time ([52c7d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/52c7d2de75365cc0b8d4a46941f5397777352e91))
* user configuration is preferred ([3050a00](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3050a008020b1739111bb0e9fbad02c0703d7593))



## [1.3.4-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.3...v1.3.4-beta.0) (2023-09-21)


### Bug Fixes

* clear request stream cache ([1ef33d5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ef33d5d7d47012999df6ab12f4aed0b0bae2d56))
* consumed request stream  causing proxy failure ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([dc1fa64](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/dc1fa64d4c605161d3988f7e4f277a846b787cb4))
* write request stream chunk to the buffer ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([1ffe73c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ffe73ce061489a4db887dd4a2205013bfbb20a4))



## [1.3.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.2...v1.3.3) (2023-09-11)


### Bug Fixes

* adjust priority of `/(.*)` and `/path/(.*)`([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([8f43318](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8f433183374a8814d1394442f5e117cdb8c28b57))



## [1.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.1...v1.3.2) (2023-09-11)


### Features

* add `debug` log type ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([a49bfe5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a49bfe5ca42daf4703ee12d1c2054b9775540bc9))
* add match the priority of the rule ([41f460c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/41f460cda88821e6756778e6969edefc2c41bcbc))
* add runtime matching info ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([f1a22a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1a22a3f2ff486a37bad5d31b4e470688370bc1c))
* customize the matching rule priority ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([5075716](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5075716e3288458164905a6c381c4dd57a9664a5))


### Performance Improvements

* match the priority of the rule ([3adc476](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3adc47607c08e589f327b89a9ed1788c50c158b7))



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.3.4-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.3...v1.3.4-beta.0) (2023-09-21)


### Bug Fixes

* clear request stream cache ([1ef33d5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ef33d5d7d47012999df6ab12f4aed0b0bae2d56))
* consumed request stream  causing proxy failure ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([dc1fa64](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/dc1fa64d4c605161d3988f7e4f277a846b787cb4))
* write request stream chunk to the buffer ([#52](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/52)) ([1ffe73c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1ffe73ce061489a4db887dd4a2205013bfbb20a4))



## [1.3.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.2...v1.3.3) (2023-09-11)


### Bug Fixes

* adjust priority of `/(.*)` and `/path/(.*)`([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([8f43318](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8f433183374a8814d1394442f5e117cdb8c28b57))



## [1.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.1...v1.3.2) (2023-09-11)


### Features

* add `debug` log type ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([a49bfe5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a49bfe5ca42daf4703ee12d1c2054b9775540bc9))
* add match the priority of the rule ([41f460c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/41f460cda88821e6756778e6969edefc2c41bcbc))
* add runtime matching info ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([f1a22a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1a22a3f2ff486a37bad5d31b4e470688370bc1c))
* customize the matching rule priority ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([5075716](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5075716e3288458164905a6c381c4dd57a9664a5))


### Performance Improvements

* match the priority of the rule ([3adc476](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3adc47607c08e589f327b89a9ed1788c50c158b7))



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.3.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.2...v1.3.3) (2023-09-11)


### Bug Fixes

* adjust priority of `/(.*)` and `/path/(.*)`([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([8f43318](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8f433183374a8814d1394442f5e117cdb8c28b57))



## [1.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.1...v1.3.2) (2023-09-11)


### Features

* add `debug` log type ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([a49bfe5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a49bfe5ca42daf4703ee12d1c2054b9775540bc9))
* add match the priority of the rule ([41f460c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/41f460cda88821e6756778e6969edefc2c41bcbc))
* add runtime matching info ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([f1a22a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1a22a3f2ff486a37bad5d31b4e470688370bc1c))
* customize the matching rule priority ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([5075716](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5075716e3288458164905a6c381c4dd57a9664a5))


### Performance Improvements

* match the priority of the rule ([3adc476](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3adc47607c08e589f327b89a9ed1788c50c158b7))



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.3.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.1...v1.3.2) (2023-09-11)


### Features

* add `debug` log type ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([a49bfe5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a49bfe5ca42daf4703ee12d1c2054b9775540bc9))
* add match the priority of the rule ([41f460c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/41f460cda88821e6756778e6969edefc2c41bcbc))
* add runtime matching info ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([f1a22a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f1a22a3f2ff486a37bad5d31b4e470688370bc1c))
* customize the matching rule priority ([#48](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/48)) ([5075716](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5075716e3288458164905a6c381c4dd57a9664a5))


### Performance Improvements

* match the priority of the rule ([3adc476](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3adc47607c08e589f327b89a9ed1788c50c158b7))



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.3.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0...v1.3.1) (2023-08-26)


### Features

* add `defineMockData()` to support share mock data ([594777d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/594777d68b77b92704c8668af33387f0ff427820))



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



# [1.3.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.3.0-beta.0...v1.3.0) (2023-07-26)



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



# [1.3.0-beta.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.1...v1.3.0-beta.0) (2023-07-26)


### Features

* add mock interface`log` ([0dea00b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0dea00b65abb286b6c5f0c99a5d124c340411d16))
* update mock interface`log` default value ([81c7718](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/81c7718495f57a225c7f12dc76ce48ee70bed0c1))


### Performance Improvements

* optimize cors options by default ([33e6322](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/33e63224cfef1a8de5770a10742327206ef8cf59))



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.2.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.2.0...v1.2.1) (2023-06-19)


### Bug Fixes

* rollback formidable@3 to 2.1.1 to resolve commonjs startup failure ([#34](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/34)) ([55951fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/55951fb2723ea680fdfc8d0f029eb3fc83fbe253))



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



# [1.2.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.16...v1.2.0) (2023-06-19)


### Features

* add `cors` support for consistent behavior with Vite ([f11e30d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/f11e30d8330b0e6f34cd81b4f51a417cafa1ed0f))


### Performance Improvements

* optimize middleware ([8196b4a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/8196b4ac50784d7a4d443f868194f34a768e87b8))
* optimize transform data filter ([91d7aaa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/91d7aaa2969d42e630e8c0fb75c94937fdbc368d))
* **validator:** replace `===` to `Object.is()` ([73a5a29](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/73a5a29d269e06e60b25815d9864a640311df283))



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* wx hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))
* support `WebSocket` mock ([49660ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/49660fffedf7b3e288b67c2fc3f49fe7f07a552d))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



## [1.0.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.0...v1.0.1) (2023-03-04)



# [1.0.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.3...v1.0.0) (2023-03-04)


### Features

* add `mock.url` parse ([eb0484b](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/eb0484bfefd428ca3c918849e55628e5def3d849))
* add `reload` option ([9788d2d](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9788d2d3ed974922c60722149c5f24f58eb662d6))



## [0.4.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.4.2...v0.4.3) (2023-02-27)


### Features

* deal with execution error ([0c91629](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0c91629a39ab4f1817f4e33ecfd3ad77a6cbc21b))


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



## [0.3.17](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v0.3.16...v0.3.17) (2023-02-02)


### Features

* add `build` options types ([5a814a3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/5a814a39a96faf6d0662aba7e703f5adad2df66f))
* add generator server ([65ee84f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/65ee84f739cd163184c95b8b5113b4878e56a552))



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



## [1.1.16](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.15...v1.1.16) (2023-05-23)


### Bug Fixes

* **build:** incorrectly recognize define:import as third-party package ([d3f2ced](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3f2cedf5c08e8370ccbef3da9195bcffad3f345))



## [1.1.15](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.14...v1.1.15) (2023-05-23)


### Bug Fixes

* Invalid define value ([#31](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/31)) ([97b8294](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/97b8294691d46426066b37544115f8fd450301b2))



## [1.1.14](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.13...v1.1.14) (2023-05-22)


### Features

* add delayed response time range support ([d6f2244](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d6f22449ebad26ba091114e21a777903eb6fead0))
* **validator:** support deep object comparison for inclusion relationship ([a293e5f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a293e5ffb11cf9100a3955d3f7a34205df281d3f))


### Performance Improvements

* Replace `url.parse` to `new URL()` ([21044b3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/21044b370a082e35dda568f326d8e62f77067272))



## [1.1.13](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.12...v1.1.13) (2023-05-18)


### Performance Improvements

* optimize `define` ([ee5fa3f](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ee5fa3fc2669a63a7b383214f43077e17a1c932c))



## [1.1.12](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.11...v1.1.12) (2023-05-18)


### Bug Fixes

* **transform:** empty validator sorting ([b114023](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b114023c4f6b0de9670c5a910532e28380c49903))


### Features

* add `env` support ([66a0420](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/66a04207e40a06c6f17c2a639bbe7c7f2c9e5580))
* add custom header `X-File-Path` ([d3ee0f7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3ee0f791ddb2e40fca11ad8fe86250ca1ee0ac8))


### Performance Improvements

* optimize websocket mock options ([76db7fb](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/76db7fb34bed0fb396bd2023b6dd821e7caebc2c))



## [1.1.11](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.10...v1.1.11) (2023-05-11)


### Bug Fixes

* **transform:**  priority sorting error ([#28](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/28)) ([9cdcf59](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9cdcf599a0b95e7f00cf765becfa245238298946))



## [1.1.10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.9...v1.1.10) (2023-05-10)


### Bug Fixes

* **build:** mock files named exports resolved fail ([b11320a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b11320adb8628287a1ffa4bbf9e7c1a649c5a72b))
* mock files named exports resolved fail ([56967fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/56967fed847c367e09805804bba71c24de21b816))
* Optimize the path matching priority ([3f0ba10](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3f0ba102876b083d7347159819053b043910f798))



## [1.1.9](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.8...v1.1.9) (2023-05-04)


### Bug Fixes

* ws hmr error ([b3a2483](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/b3a2483a810e8f7b985e37c14bdccac96883c2a4))


### Performance Improvements

* optimize resolved mock file ([d97c9ac](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d97c9acb2542faa141061b84dc9b7a0ffc989f72))



## [1.1.8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.7...v1.1.8) (2023-05-02)


### Performance Improvements

* optimize error log ([ecc60fe](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/ecc60fe64db042c34306d77258e324fab6fb5b9c))
* optimize transformer ([c6e414a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c6e414aa3e877213038511911b79e37aeafb6001))
* optimize ws hmr ([9a93c37](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/9a93c37e0880cf553a9fcecc12e0d9a98564d947))



## [1.1.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.6...v1.1.7) (2023-05-01)



## [1.1.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.5...v1.1.6) (2023-04-30)


### Features

* support `WebSocket` mock ([d1e5352](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d1e5352133d62ecaf440a5cf8eb079186aee7478))


### Performance Improvements

* optimize esbuild compile ([3c8916a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3c8916a253d5edab5a752e757c92b12d05a934ce))



## [1.1.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.4...v1.1.5) (2023-04-26)


### Performance Improvements

* optimize `startsWith` to `===` ([0908397](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0908397845b62a1209749c2d6241f57d814debaf))
* Optimize the sorting of the `mockList` ([0a79516](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0a79516af43451f973025abaa0bf700094515fcc))



## [1.1.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.3...v1.1.4) (2023-04-25)


### Features

* validator support cookies ([1f1c8ff](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/1f1c8ff18101cbe792163e33c253bd39a27f2d78))



## [1.1.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.2...v1.1.3) (2023-04-24)


### Bug Fixes

* correctly exclude all ws when filtering proxy ([c4c2ac7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/c4c2ac750199e5e9099b5cbdbafe840e7025ee45))


### Features

* support `type` option, `text/json/buffer` ([3ac25f1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3ac25f1f80fba52b44c1a13949da543793dd1163))



## [1.1.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.1...v1.1.2) (2023-04-22)


### Performance Improvements

* optimize cookies options ([230e41c](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/230e41c8b9cd1047fcbdbe0a1595eda242d4968d))
* Perfect type declaration ([fa16506](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fa165063fdc91cbae41e43d48fac60afb4668e51))



## [1.1.1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.1.0...v1.1.1) (2023-04-22)


### Bug Fixes

* perf real delay `response` option ([72edd1e](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/72edd1ea2681406305e7d8f2e4bcf0a034383de7))



# [1.1.0](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.7...v1.1.0) (2023-04-22)


### Features

* add cookies parse support ([51ac8aa](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/51ac8aae4cf8bd96e73014c0c7fa7b5fc83aa6a1))
* add cookies parse support to `build` ([6d69ead](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/6d69ead0617df9421cb6d3c4b4ff15957a75d80c))



## [1.0.7](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.6...v1.0.7) (2023-03-22)


### Features

* add `createDefineMock` method ([04e8ee8](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/04e8ee818683a3eb8f6c21970629aeb4f0a93e32))
* support `resolve.alias` [#22](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/22) ([fbf87d1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/fbf87d118f10059a653658a56e3bceda5ceee83d))



## [1.0.6](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.5...v1.0.6) (2023-03-21)


### Performance Improvements

* Optimize exclude and remove `src` ([d3c602a](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/d3c602a9f556c378c133f533839f4fb494390064))
* Optimize exclude and remove `test` ([30f2694](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/30f269431de3ab56db7f41afbccd73a57e588959))



## [1.0.5](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.4...v1.0.5) (2023-03-16)


### Bug Fixes

* **build:** path posix error [#21](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/21) ([3d5a066](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/3d5a0667e7960ad250c650a3c6afa9330ad7adbd))


### Performance Improvements

* **build:** add `cors` to excludeDeps ([a231646](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/a2316465824ac889714f26cce0a10c740d3a4d67))



## [1.0.4](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.3...v1.0.4) (2023-03-09)


### Performance Improvements

* optimize mock transformer ([e6d46e1](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/e6d46e125591bcbd154b3c94fcb6025dfad00ca1))



## [1.0.3](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.2...v1.0.3) (2023-03-09)


### Bug Fixes

* **MockLoader:** empty mock file compile fail [#19](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/issues/19) ([0f44752](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/0f44752f84b04b207112e1b94a562098bc1981d3))



## [1.0.2](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/compare/v1.0.1...v1.0.2) (2023-03-05)


### Features

* add 'cors' to the deployable mock server ([652a438](https://github.com/pengzhanbo/vite-plugin-mock-dev-server/commit/652a43841ae4c233aed9f6469660aed4c805b9a2))



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



