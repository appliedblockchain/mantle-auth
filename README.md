# Mantle Auth

Authorization functionality for Koa routers

## Usage

### Details

The purpose of Mantle Auth is to generate [Koa] middleware Functions that will perform various authorization related tasks. It can generate individual route middleware, but as a convenience is also capable of creating [definition Objects](#route-definitions) that can be used as routes by [joi-router], or even a [joi-router instance](#router) with those routes already created.

Most (possibly all) of these tasks require data storage that persists between requests, so Mantle Auth makes use of [Adapters](#adapters) in an effort to add a level of abstraction between the route handling logic and data management. Before any of the middleware Functions are called an adapter must be created and set, and the adapter chosen will control where data is persisted to / retrieved from.

#### Router

A router creation Function can be found here:
```js
const { create } = require('@appliedblockchain/mantle-auth/router')
```
Invoking it will create a [joi-router] instance. See [./router.js](./router.js) or [Examples](#examples) below for usage

#### Route Definitions

These are Objects that are suitable for input to the [joi-router route](https://github.com/koajs/joi-router#route) method. The route definition functionality is stored here:
```js
const route_name = require('@appliedblockchain/mantle-auth/routes/route_name')
// OR
const { route_name } = require('@appliedblockchain/mantle-auth/routes')
```
Each route definition has the following exports:
- definition: [joi-router] definition Object *without* a `handler`
- createHandler: Function that will create a [Koa] middleware for the route. It can also be added as the `handler` of 'definition'.
- createRoute: Helper Function that will create a handler, append it to the definition and return the result

#### Middleware

More specifically, middleware that passes requests along to other middleware rather than perform request resolution. They are stored here:
```js
const middleware_name = require('@appliedblockchain/mantle-auth/middleware/middleware_name')
// OR
const { middleware_name } = require('@appliedblockchain/mantle-auth/middleware')
```
Each middleware has the following exports:
- middleware: a [Koa] compatible middleware function

#### Adapters

Adapters are stored here:
```js
const adapter_name = require('@appliedblockchain/mantle-auth/storage/adapters/adapter_name')
// OR
const { adapter_name } = require('@appliedblockchain/mantle-auth/storage/adapters')
```
Each adapter exports a class that can be used to instantiate new adapters
They can be get/set with the methods obtained from here:
```js
const { getAdapter, setAdapter } = require('@appliedblockchain/mantle-auth/adapters')
  ```

### Examples

#### Routes

Quick:
```js
const { create } = require('@appliedblockchain/mantle-auth/router')

const router = create({
  psqlConnect: 'postgres://user:pass@localhost:5432/mydb',
  routeOptions: {
    login: {
      jwt: { secret: 'MY JWT SECRET' }
    }
  }
})

const server = new (require('koa'))()
  .use(router.middleware())
  .listen(1337)
```

Full:
```js
const { create } = require('@appliedblockchain/mantle-auth/router')
const { createRoute } = require('@appliedblockchain/mantle-auth/routes/login')
const { setAdapter } = require('@appliedblockchain/mantle-auth/storage/adapters')
const PsqlAdapter = require('@appliedblockchain/mantle-auth/storage/adapters/psql')

const router = create({
  routeList: [
    createRoute({
      jwt: { secret: 'MY JWT SECRET' }
    })
  ]
})

const adapter = new PsqlAdapter({
  dbNameMap: { table: 'admin_user' },
  connection: {
    database: 'mydb',
    host: 'localhost',
    password: 'pass',
    port: 5432,
    user: 'user'
  }
})

setAdapter(adapter)

const server = new (require('koa'))()
  .use(router.middleware())
  .listen(1337)
```

#### Middleware

```js
const {
  handle: { jwt },
  middleware
} = require('@appliedblockchain/mantle-auth/middleware/authorization')

const checkAuth = middleware({ handle: jwt('MY JWT SECRET') })

const server = new (require('koa'))()
  .use(checkAuth)
  // other routes go here
  .listen(1337)
```

## Development

See [Development.md](Development.md)


[Koa]:        https://koajs.com/
[joi-router]: https://github.com/koajs/joi-router
