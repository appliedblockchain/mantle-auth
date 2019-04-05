const _ = require('lodash')
const request = require('supertest')
const Router = require('koa-joi-router')

const MemoryAdapter = require('storage/adapters/memory')
const { createKoaApp } = require('../utils.js')
const { createRoute } = require('routes/login')
const { hashPassword } = require('../../auth')
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
  let memoryData

  beforeAll(async () => {
    const password = await hashPassword(data.password)
    memoryData = { ...data, ...{ password } }
  })

  describe('The login validation', () => {
    let server

    beforeAll(async () => {
      const router = new Router()
      router.route(createRoute({
        jwt: { secret: jwtSecret },
        lockAfter: 3
      }))

      server = (await createKoaApp())
        .use(router.middleware())
        .listen()
    })

    beforeEach(() => {
      const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData } ] })
      setAdapter(adapter)
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

    it('Returns a 500 error code when sending an invalid user', async () => {
      await request(server)
        .post(endpoint)
        .send({ email: 'who@noone.com', password: data.password })
        .expect(500)
    })

    it('Returns a 400 error code when sending unexpected POST data', async () => {
      await request(server)
        .post(endpoint)
        .send({ invalid_field: 'abc' })
        .expect(400)
    })

    it('Returns a 401 error code when sending invalid credentials', async () => {
      await request(server)
        .post(endpoint)
        .send({ email: data.email, password: 'fake_password' })
        .expect(401)
    })
  })

  describe('The locking of a user account after a number of failed login attempts functionality', () => {
    describe('When lockAfter is not null', () => {
      let server

      beforeAll(async () => {
        const router = new Router()
        router.route(createRoute({
          jwt: { secret: jwtSecret },
          lockAfter: 3
        }))

        server = (await createKoaApp())
          .use(router.middleware())
          .listen()
      })

      afterAll(async () => {
        await server.close()
      })

      it('200, successful login', async () => {
        const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData, login_attempts: 2 } ] })
        setAdapter(adapter)

        await doValidLogin(server)
          .expect(200)
      })

      it('401, on one more unsuccessful login when login_attempts is lockAfter - 1', async () => {
        const initialLoginAttempts = 2
        const email = data.email

        const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData, login_attempts: initialLoginAttempts } ] })
        setAdapter(adapter)

        await request(server)
          .post(endpoint)
          .send({ email, password: 'fake_password' })
          .expect(401)
          .then(async () => {
            const user = await adapter.getUser({ email })
            expect(user.login_attempts).toBe(initialLoginAttempts + 1)
            expect(user.locked).toBe(true)
          })
      })

      it('401, on an unsuccessful login when locked === true', async () => {
        const initialLoginAttempts = 3
        const email = data.email

        const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData, login_attempts: initialLoginAttempts, locked: true } ] })
        setAdapter(adapter)

        await request(server)
          .post(endpoint)
          .send({ email, password: 'fake_password' })
          .expect(401)
          .then(async () => {
            const user = await adapter.getUser({ email })
            expect(user.login_attempts).toBe(initialLoginAttempts)
          })
      })
    })

    describe('When lockAfter is null', () => {
      let server

      beforeAll(async () => {
        const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData } ] })
        setAdapter(adapter)

        const router = new Router()
        router.route(createRoute({
          jwt: { secret: jwtSecret },
          lockAfter: null
        }))

        server = (await createKoaApp())
          .use(router.middleware())
          .listen()
      })

      afterAll(async () => {
        await server.close()
      })

      it('200, successful login', async () => {
        await doValidLogin(server)
          .expect(200)
      })

      it('401, on an unsuccessful login', async () => {
        await request(server)
          .post(endpoint)
          .send({ email: data.email, password: 'fake_password' })
          .expect(401)
      })
    })
  })

  describe('The return data functionality', () => {
    it('Should, when a function is specified, pass it the user data and attach that function\'s output to the response', async () => {
      let passedData
      const fakeData = { doge: 'coin', best: 'c01n' }

      const adapter = new MemoryAdapter({ userDataList: [ { ...memoryData } ] })
      setAdapter(adapter)

      const router = new Router()
      router.route(createRoute({
        jwt: { secret: jwtSecret },
        returning: data => {
          passedData = data
          return fakeData
        }
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
        returning: [ 'email', 'name', 'fakeKey' ]
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
