## Prerequisites

- [Docker][]
- [Node.js][] and [npm][]

## Setup

Run `npm install` from the root directory of the project.

## Testing

Tests are written for [Jest]. They can be run with the following commands:

- `npm test` runs all tests *except* for the PSQL adapter test
- `npm run test:all` runs all tests
- `npm run test:pg` runs the PSQL adapter test

The PSQL adapter test requires a PSQL server that it can connect to in order to run. Such a server can be start with the following [Docker] cli command:
```sh
docker run --rm -p 5432:5432 --name pg postgres:10.6
```

The PSQL adapter test also requires a database with a 'person' table to exist on the server. If the server is running then the database and table can be created with the following [Docker] cli commands:
```sh
docker exec -u postgres pg psql -c 'CREATE DATABASE mantle_auth_test;'
docker exec -u postgres pg psql -d mantle_auth_test -c 'CREATE TABLE "person" ("name" VARCHAR, "email" VARCHAR NOT NULL PRIMARY KEY, "password" VARCHAR, "login_attempts" INTEGER DEFAULT 0);'
```


[Docker]:   https://www.docker.com/products/docker-engine
[Jest]:     https://jestjs.io/
[Node.js]:  https://nodejs.org/
[npm]:      https://www.npmjs.com/
