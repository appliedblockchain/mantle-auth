'use strict'

const path = require('path')

/**
 * Generates an 'authMiddleware' exclude option compatible function from one or more koa-joi-routers
 *
 * To use this function, each koa-joi-router route that should be excluded from authorisation must add the key-value pair `[excludeProperty]: true` to its route definition parameters. Then, once all routes and prefixes have be supplied to a koa-joi-router(s), those routers can then be passed as arguments to this function. It will then generate a function that will correctly exclude all specified routes from authorisation when used as the value of the `exclude` option of 'authMiddleware'.
 * @func joiDefinitionExclude
 * @param {Array.<Object>|Object} routerList An array or single instance of koa-joi-router(s)
 * @param {Object} [options]
 * @param {String} [options.excludeProperty='authExclude'] The key whose value is used to decide if a route should be excluded from authorisation
 * @returns {Function} A function that accepts a Koa context as its sole argument and returns a Boolean indicating if that route should be excluded from requiring 'authMiddleware' authentication
 * @example ```
 * const Koa = require('koa')
 * const Router = require('koa-joi-router')
 * const {
 *   authMiddleware,
 *   exclude: { joiDefinition: joiDefinitionExclude }
 * } = require('mantle-auth')
 *
 * const handler = ctx => ctx.status = 200
 *
 * const routeDefinitionList = [
 *   {
 *     authExclude: true,
 *     method: 'get',
 *     path: '/excluded',
 *     handler
 *   },
 *   {
 *     method: 'get',
 *     path: '/included',
 *     handler
 *   }
 * ]
 *
 * const router = new Router()
 * router.route(routeDefinitionList)
 * router.prefix('/my-prefix')
 *
 * const exclude = joiDefinitionExclude(routeDefinitionList)
 *
 * const server = new Koa()
 *   .use(authMiddleware('my_jwt_secret', { exclude }))
 *   .use(router.middleware())
 *   .listen(1337)
 * ```
 */
module.exports = (routerList, { excludeProperty = 'authExclude' } = {}) => {
  const excludeList = (routerList instanceof Array ? routerList : [ routerList ])
    .map(router => {
      const prefix = router.router.opts.prefix

      return router.routes
        .filter(route => route[excludeProperty])
        .map(route => ({ ...route, path: path.join(prefix || '', route.path) }))
    })
    .reduce((flat, routeList) => flat.concat(routeList))
    .map(definition => {
      const methodList = definition.method.map(m => m.toLowerCase())

      return [ methodList, definition.path ]
    })

  return ctx => excludeList.some(([ methodList, path ]) => methodList.includes(ctx.method.toLowerCase()) && ctx.path === path)
}
