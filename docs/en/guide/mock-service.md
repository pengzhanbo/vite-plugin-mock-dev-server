# Build a standalone mock service

In some scenarios, you may need to use data provided by the mock service for display purposes, but the project may have already been built and deployed, and is no longer supported by `vite` and this plugin's mock service. Since this plugin was designed from the beginning to support importing various `node` modules in mock files, mock files cannot be bundled inline into the client build code.

To meet this type of scenario, the plugin provides support under `vite preview`, and also builds a small standalone mock service application during `vite build` that can be deployed to the relevant environment. It can then be proxied and forwarded to the actual port through another HTTP server such as Nginx to achieve mock support.

By default, the build output is in the `dist/mockServer` directory and generates the following files:

```tree
.
└── mockServer
    ├── index.js
    ├── mock-data.js
    └── package.json
```

In this directory, run `npm install` to install dependencies, and then execute `npm start` to start the mock server.
The default port is `8080`.
You can access the related `mock` APIs through `localhost:8080/`.
