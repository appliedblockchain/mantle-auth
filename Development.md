## Prerequisites

- [Docker][]
- [Node.js][] and [npm][]

## Setup

Run `npm install` from the root directory of the project.

## Testing

Tests are written for [Jest]. They can be run with the following commands:

- `npm test` runs all tests *except* for the PSQL adapter test
- `npm run test:all` runs all tests
- `npm run test:pg` only runs the PSQL adapter test

The PSQL adapter test requires a PSQL server  with a database named "mantle_auth_test" that it can connect to in order to run. Such a server can be start with the following command:
```sh
npm run test-database
```
It will start an instance using docker

The PSQL adapter test also requires a table "person" to exist on the server. If the server is running then the table can be created with the following commands:
```sh
npm run init-test-database
```


[Docker]:   https://www.docker.com/products/docker-engine
[Jest]:     https://jestjs.io/
[Node.js]:  https://nodejs.org/
[npm]:      https://www.npmjs.com/
