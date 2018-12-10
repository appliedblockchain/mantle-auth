const { setAdapter } = require('./storage/adapters')
const PsqlAdapter = require('./storage/adapters/psql')
const Router = require('koa-joi-router')

const getDefaultRouteList = routeOptionMap => {
  const routeMap = require('./routes')

  return Object
    .entries(routeMap)
    .map(([ name, { createRoute } ]) => createRoute(routeOptionMap[name]))
}

const create = ({ routeList, routeOptions, psqlConnect } = {}) => {
  setAdapter(new PsqlAdapter({ connection: psqlConnect }))

  if (!routeList && !routeOptions) {
    throw new Error('One of "routeList" or "routeOptions" must be given')
  }

  const router = new Router()
  router.route(routeList || getDefaultRouteList(routeOptions))

  return router
}

module.exports = {
  create
}
