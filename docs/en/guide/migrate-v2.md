# Migrate from v1.x

## Rolldown & Esbuild Support

The plugin now automatically selects different compilers to process mock files based on different versions of Vite.

For the `vite@npm:rolldown-vite@latest` version, `rolldown` is used as the compiler.

## path-to-regexp Upgraded from v6 to v8

The plugin now uses [`path-to-regexp@v8`](https://github.com/pillarjs/path-to-regexp#readme) as the path matching engine.

Please refer to the [official documentation](https://github.com/pillarjs/path-to-regexp#unexpected--or-) for adaptation and upgrade.

## Plugin Configuration

Added a new `dir` configuration option to specify the directory for mock files, relative to `cwd`. The matching context for `include` and `exclude` is `cwd + dir`.

::: details Why was this adjustment made?

The plugin uses `chokidar` to monitor changes in mock files, starting the matching from the `cwd` directory by default. The search scope may be too large for medium to large projects,

which could lead to unnecessary performance overhead. Therefore, the `dir` configuration option has been added to further narrow down the search scope.

:::
