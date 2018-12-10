const { middleware: authMiddleware } = require('middleware/authorization')
const { jwt: jwtHandle } = require('middleware/authorization/handle')
const { createKoaApp } = require('../utils.js')
const { jwtSign } = require('../../auth')
const http = require('http')
const request = require('supertest')

describe('Auth middleware:', () => {
  let app, server, jwtSecret

  beforeAll(async () => {
    jwtSecret = 'fake_secret'
    app = await createKoaApp()
    app.use(authMiddleware({
      exclude: ctx => ctx.path === '/exclude-me',
      handle: jwtHandle(jwtSecret)
    }))
    app.use(ctx => {
      ctx.body = 'Test route success'
    })
    server = http.createServer(app.callback())
  })

  afterAll(async () => {
    await server.close()
  })

  it('Returns a 401 error code if a JWT has not been included in the authorization header', async () => {
    const { status } = await request(server).get('/')
    expect(status).toEqual(401)
  })

  it('Returns a 401 error code if an invalid token is supplied', async () => {
    const { status } = await request(server)
      .get('/')
      .set('Authorization', 'Bearer invalid_token')

    expect(status).toEqual(401)
  })

  it('Returns a 200 success code if a valid token is supplied', async () => {
    const token = jwtSign({ personId: 1 }, jwtSecret)
    const { status, text } = await request(server)
      .get('/test-route')
      .set('Authorization', `Bearer ${token}`)

    expect(status).toEqual(200)
    expect(text).toEqual('Test route success')
  })

  it('Correctly excludes routes', async () => {
    const { status, text } = await request(server).get('/exclude-me')

    expect(status).toEqual(200)
    expect(text).toEqual('Test route success')
  })
})
