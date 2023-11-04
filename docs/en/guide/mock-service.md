## Mock Service Deployment

In some scenarios, it may be necessary to use data provided by the mock service for display purposes. However, the project may have been built and deployed, and has been separated from the mock service support provided by `vite` and this plugin. Since this plugin supports importing various `node` modules in mock files from the beginning, the mock files cannot be bundled inline with the client build code.

To meet this type of scenario, the plugin provides support for `vite preview`, and also builds a small standalone mock service application during `vite build`, which can be deployed to the relevant environment. It can then be proxied and forwarded to the actual port through another HTTP server such as Nginx to achieve mock support.

By default, the build output is in the `dist/mockServer` directory and generates the following files:

```sh
./mockServer
├── index.js
├── mock-data.js
└── package.json
```

In this directory, run `npm install` to install dependencies, and then execute `npm start` to start the mock server.

The default port is `8080`.

You can access the related mock APIs through `localhost:8080/`.
