const _ = require('lodash')
const request = require('supertest')
const Router = require('koa-joi-router')

const MemoryAdapter = require('storage/adapters/memory')
const { createKoaApp } = require('../utils.js')
const { createRoute } = require('routes/login')
const { personData: data } = require('../data')
const { setAdapter } = require('storage/adapters')

const endpoint = '/login'
const jwtSecret = 'password123'

function doValidLogin(server) {
  return request(server)
    .post(endpoint)
    .send({ email: data.email, password: data.password })
}

describe('The login functionality', () => {
  beforeAll(async () => {
    const adapter = new MemoryAdapter([ data ])

    setAdapter(adapter)
  })

  describe('The login validation', () => {
    let server

    beforeAll(async () => {
      const router = new Router()
      router.route(createRoute({
        jwt: { secret: jwtSecret },
        lockAfter: 3,
        comparePasswordFunc: p => p
      }))

      server = (await createKoaApp())
        .use(router.middleware())
        .listen()
    })

    afterAll(async () => {
      await server.close()
    })

    it('Returns a JWT when sending valid credentials', async () => {
      const { body } = await doValidLogin(server)
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

  describe('The return data functionality', () => {
    it('Should, when a function is specified, pass it the user data and attach that function\'s output to the response', async () => {
      let passedData
      const fakeData = { doge: 'coin', best: 'c01n' }

      const router = new Router()
      router.route(createRoute({
        jwt: { secret: jwtSecret },
        returning: data => {
          passedData = data
          return fakeData
        },
        comparePasswordFunc: p => p
      }))

      const server = (await createKoaApp())
        .use(router.middleware())
        .listen()

      const { body: { token, user } } = await doValidLogin(server)
        .expect(200)

      expect(_.omit(passedData, 'password')).toEqual(_.omit(data, 'password'))
      expect(token).toBeDefined()
      expect(user).toEqual(fakeData)

      server.close()
    })

    it('Should map the return data correctly when given an array', async () => {
      const router = new Router()
      router.route(createRoute({
        jwt: { secret: jwtSecret },
        returning: [ 'email', 'name', 'fakeKey' ],
        comparePasswordFunc: p => p
      }))

      const server = (await createKoaApp())
        .use(router.middleware())
        .listen()

      const { body: { token, user } } = await doValidLogin(server)
        .expect(200)

      expect(token).toBeDefined()
      expect(user).toEqual({ email: data.email, name: data.name, fakeData: undefined })

      server.close()
    })
  })
})
