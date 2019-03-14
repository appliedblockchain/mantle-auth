const knex = require('knex')({
  client: 'pg',
  connection: 'postgres://postgres:password@localhost:5432/mantle_auth_test'
})

const initDb = async () => {
  try {
    await knex.raw('CREATE TABLE "person" ("name" VARCHAR, "email" VARCHAR NOT NULL PRIMARY KEY, "password" VARCHAR);')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

initDb()
