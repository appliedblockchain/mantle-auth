/**
 * @description Authorization middleware that can be attached to an instance of koa in order to control the access of requests to its routes
 * @param {Object} options
 * @param {Function} options.handle
 * @param {Function} [options.exclude]
 * @return {Function} Koa middleware
 */
module.exports = ({ exclude = (() => false), handle }) => {
  return async (ctx, next) => {
    const isAuthenticated = await handle(ctx)

    // if user is authenticated otherwise check if the endpoint can be accessed by unauthenticated users
    if (!isAuthenticated) {
      const isExcluded = await exclude(ctx)

      if (!isExcluded) {
        ctx.throw(401)
      }
    }

    return next()
  }
}
