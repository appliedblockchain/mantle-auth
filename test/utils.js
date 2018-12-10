const Koa = require('koa')
const cors = require('@koa/cors')
const compress = require('koa-compress')
const respond = require('koa-respond')

const createKoaApp = async () => {
  const app = new Koa()

  app
    .use(compress())
    .use(respond())
    .use(cors())

  return app
}

module.exports = {
  createKoaApp
}
