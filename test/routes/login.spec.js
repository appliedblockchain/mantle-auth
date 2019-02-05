const PsqlAdapter = require('storage/adapters/psql')
const { createKoaApp } = require('../utils.js')
const { createRoute } = require('routes/login')
const { setAdapter } = require('storage/adapters')
const { hashPassword } = require('../../auth')
const { personData } = require('../data')
const http = require('http')
const request = require('supertest')
const Router = require('koa-joi-router')

const endpoint = '/login'

describe(`POST ${endpoint}`, () => {
  let adapter, app, server
  const data = personData

  beforeAll(async () => {
    adapter = new PsqlAdapter({
      connection: {
        host: 'localhost',
        user: 'postgres',
        database: 'test'
      }
    })

    const hashedPassword = await hashPassword(data.password)

    const insertData = {
      ...data,
      password: hashedPassword
    }

    const router = new Router()
    router.route(createRoute({ jwt: { secret: 'password123' } }))

    setAdapter(adapter)

    app = await createKoaApp()
    app.use(router.middleware())

    server = http.createServer(app.callback())

    await adapter.knex('person').insert(insertData)
  })

  afterAll(async () => {
    await adapter.knex.truncate('person')

    await adapter.knex.destroy()
    await server.close()
  })

  it('Returns a JWT when sending valid credentials', async () => {
    const { body } = await request(server)
      .post(endpoint)
      .send({ email: data.email, password: data.password })
      .expect(200)

    expect(body.token).toBeTruthy()
    expect(typeof body.token === 'string').toEqual(true)
  })

  it('Returns a 401 error code when sending an invalid user', async () => {
    await request(server)
      .post(endpoint)
      .send({ email: 'who@noone.com', password: data.password })
      .expect(401)
  })

  it('Returns a 401 error code when sending invalid credentials', async () => {
    await request(server)
      .post(endpoint)
      .send({ email: data.email, password: 'fake_password' })
      .expect(401)
  })

  it('Returns a 400 error code when sending unexpected POST data', async () => {
    await request(server)
      .post(endpoint)
      .send({ invalid_field: 'abc' })
      .expect(400)
  })
})
