# Teamwork

During collaborative development in a team, it is inevitable to encounter conflicts when multiple people modify the same `mock file` simultaneously.

On one hand, you can establish collaboration guidelines and specify maintenance standards for `mock files` to avoid such issues.
On the other hand, within the plugin, a solution is provided to address team collaboration conflicts and improve debugging efficiency.

## Solution

In [File Directory Management](./file-management), we have provided the recommended approach for standardizing and refining the management of `mock files`. However, even when refining to a single file for **single interface + parameter validation**, it is still inevitable to encounter conflicts when multiple people modify the same interface.

In this scenario, a recommended solution is to localize the mock file and exclude it from being committed to git:

Create a `*.local.mock.ts` file and add `*.local.mock.*` to the `.gitignore` file.

The plugin will still load this file correctly, and team members can modify this file on their respective development machines. Since it will not be committed, it can directly avoid file conflicts.

## referer query

> Thanks to [jiadesen](https://github.com/jiadesen) for proposing this `feature` and contributing code!

`*.local.mock.*` can solve the conflict problem to some extent, but it also prevents team members from directly sharing these mock files. They need to use third-party tools to achieve mutual sharing.

In fact, as long as we provide a way to use `request headers/body/query/params` as a `validator` without using mock APIs, we can solve this problem well.

Therefore, it is a good idea to use the source page address that initiates the mock API to differentiate, because this allows us to directly modify the address in the browser's address bar to differentiate the parameters returned!

The source page address that initiates the mock API will also be attached to the `referer` field of the `mock request`, so the plugin can implement a new `validator` by parsing the `referer` field.

For example, the following configuration:

``` ts
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock({
  url: '/api/demo',
  validator: {
    refererQuery: {
      a: 1
    }
  },
  body: {
    message: 'request from "http://example.com/?a=1"'
  }
})
```

The `/api/demo` interface will only respond to requests that have the `?a=1` query parameter in the referring source address, such as `http://example.com/?a=1`.

Therefore, we can split the mock files based on `refererQuery` and refine the file management according to the team's specified collaboration guidelines.

Moreover, by directly modifying the address in the browser's address bar, we can bypass Vite compilation and directly reload page data, thereby improving debugging efficiency.
