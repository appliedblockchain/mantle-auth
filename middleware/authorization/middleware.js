/**
 * @description Authorization middleware that can be attached to an instance of Koa in order to control the access of requests to its routes
 * @param {Object} options
 * @param {Function} options.handle (Optionally async) Function that gets called to determine if the request has valid authorization credentials. It will receive the koa ctx as its sole argument and should return true if the request is valid or false otherwise
 * @param {Function} [options.exclude] Function that gets called to determine if certain requests should be considered valid regardless of credentials. It will receive the Koa ctx as its sole argument and should return true if validation should be skipped or false otherwise. If omitted then all requests require valid credentials.
 * @return {Function} Koa middleware
 */
module.exports = ({ exclude = (() => false), handle }) => {
  return async (ctx, next) => {
    const isExcluded = await exclude(ctx)
    const isAuthenticated = await handle(ctx)

    if (!isExcluded && !isAuthenticated) {
        ctx.throw(401)
    }

    return next()
  }
}
