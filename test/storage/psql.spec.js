/*
Test for PSQL storage adapter.

For it to work a database must exist and be accessible via the credentials defined in the `connection` variable. That database also needs to have the following table:
```
CREATE TABLE "person" (
  "name"      VARCHAR,
  "email"     VARCHAR NOT NULL  PRIMARY KEY,
  "password"  VARCHAR
);
```
Note that this test will delete the contents of that table when run.
*/

const initKnex = require('knex')

const PsqlAdapter = require('storage/adapters/psql')
const base = require('./base')

const connection = {
  host: 'localhost',
  user: 'postgres',
  database: 'mantle_auth_test'
}

let knex

describe.skip('The PSQL storage adapter', base({
  before: async data => {
    knex = initKnex({
      client: 'pg',
      connection
    })

    await knex.truncate('person')
    await knex('person').insert(data)
  },
  createAdapter: () => new PsqlAdapter({ connection }),
  after: async () => {
    await knex.truncate('person')
    await knex.destroy()
  }
}))
