const jwt = require('jsonwebtoken')

/**
 * Creates a Function for validating requests with JWT authorization; See docstring where the return value is defined for info on its behaviour
 * @function jwt
 * @param {String} secret The secret that was used to create jwt tokens that we wish to verify
 * @param {Object} [options] Options to use when verifying a jwt; See the jsonwebtoken `verify` method
 * @returns {Function}
 * @see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
 */
module.exports = (secret, options = {}) => {
  if (!secret) {
    throw new Error('Cannot initialize JWT auth middleware handler without providing a secret')
  }

  /**
   * Checks a Koa request for a valid jwt header and returns whether it is valid or not
   * @function handle
   * @param {Object} ctx Koa ctx
   * @returns {Boolean} `true` if the request has a valid jwt in its headers or `false` otherwise
   */
  return ctx => {
    const token = (ctx.headers.authorization || '').replace(/\s*bearer\s*/i, '')

    if (!token) {
      return false
    }

    try {
      ctx.state.auth = jwt.verify(token, secret, options)
    } catch (e) {
      return false
    }

    return true
  }
}
