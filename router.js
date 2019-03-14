const { setAdapter } = require('./storage/adapters')
const PsqlAdapter = require('./storage/adapters/psql')
const Router = require('koa-joi-router')

/**
 * Builds an Array of joi-router route definitions from the routes defined within './routes'
 * @param {Object.<String,Object>} routeOptionMap Map defining which routes to create and their options. The key should match the name of the directory within './routes' where the route is exported, and the values should be the options Object to pass to its `createRoute` Function. Routes for which no key is defined will not be created and attempting to use a key for which no route exists will cause an Error.
 * @returns {Array.<Object>} An array of joi-router route definitions
 */
const buildRouteListFromOptions = routeOptionMap => {
  const routeMap = require('./routes')

  return Object.entries(routeMap)
    .filter(([ name ]) => name in routeOptionMap)
    .map(([ name, { createRoute } ]) => createRoute(routeOptionMap[name]))
}

/**
 * Creates a new joi-router instance and attaches new routes defined by the parameters passed. Can also optionally create and set a specified adapter.
 * @param {Object} options Exactly one of `routeList` or `routeOptions` is required
 * @param {Array.<Object>} [routeList] List of routes to attach to the created router
 * @param {Object.<String,Object>} [routeOptions] Map defining which routes to create and their options; See `buildRouteListFromOptions`
 * @param {Object|String} [psqlConnect] If defined then a new PSQLAdapter will be created and set for use by middleware. This argument is passed directly as the `connection` parameter to a new `knex` instance, so see that for reference
 * @returns {Object} The created 'joi-router' instance
 * @see https://knexjs.org/#Installation-client
 */
const create = ({ routeList, routeOptions, psqlConnect } = {}) => {
  setAdapter(new PsqlAdapter({ connection: psqlConnect }))

  if (!routeList && !routeOptions) {
    throw new Error('One of "routeList" or "routeOptions" must be given')
  }

  const router = new Router()
  router.route(routeList || buildRouteListFromOptions(routeOptions))

  return router
}

module.exports = {
  create
}
