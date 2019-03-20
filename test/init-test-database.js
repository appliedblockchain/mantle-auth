const knex = require('knex')({
  client: 'pg',
  connection: process.env.DB_PASSWORD ? `postgres://postgres:${process.env.DB_PASSWORD}@localhost:5432/mantle_auth_test` : 'postgres://postgres@localhost:5432/mantle_auth_test'
})

const initDb = async () => {
  try {
    await knex.raw('drop table if exists "person";CREATE TABLE "person" ("name" VARCHAR, "email" VARCHAR NOT NULL PRIMARY KEY, "password" VARCHAR, "login_attempts" INTEGER DEFAULT 0);')
    await knex.destroy()
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

initDb()
