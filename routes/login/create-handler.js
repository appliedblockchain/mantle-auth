const { getAdapter } = require('../../storage/adapters')
const { comparePassword, jwtSign } = require('../../auth')
const MantleAuthError = require('../../errors/base')
const { ACCOUNT_LOCKED, INVALID_PASSWORD, INVALID_USER } = MantleAuthError.ERRORS

/**
 * Creates a new login route handler; See docstring where the return value is defined for info on its behaviour
 * @function createHandler
 * @param {Object} options
 * @param {Object} options.jwt jwt options that control creation of new tokens; See the `jwtSign` in '../../auth'
 * @param {Object} options.jwt.secret The secret to use for the jwt
 * @param {Function} [options.jwt.payload] A Function that can generate the jwt payload from user details; The default is `{ email, id }`
 * @param {Object} [options.jwt.sign={ expiresIn: '1d' }] Options for signing jwt
 * @param {?number} [options.lockAfter=null] The number of login attempts a user can fail, after which the account is marked as 'locked' (all attempts to login to a locked account will fail). If set to `null` then accounts will never be locked
 * @param {Array.<String>|Function} [options.returning]
 * @returns {Function} A Function that can be used as Koa middleware to provide a login route
 * @see file://../../auth/index.js jwtSign method
 */
module.exports = ({ jwt = {}, lockAfter = null, returning }) => {
  if (!(jwt || jwt.secret)) {
    throw new Error('jwt.secret is required')
  }

  const defaultPayload = userMap => ({ email: userMap.email, id: userMap.id })

  const createPerson = (personMap, selector) => {
    let result

    switch (true) {
      case selector instanceof Array:
        result = {}
        selector.forEach(p => {
          result[p] = personMap[p]
        })
        break

      case selector instanceof Function:
        result = selector(personMap)
        break
    }

    return result
  }

  /**
   * 'login' router handler. It behaves in the following way:
   * - it expects to receive a request that has a parsed JSON body with 'email' and 'password' properties
   * - it then attempts to retrieve the user with those details using the currently set storage adapter
   *   - if a user with those details is not found then it throws a Koa 401 Error and stops here
   * - it then checks whether login attempts is above the 'lockAfter' option
   *   - if not, then the 'locked' attribute is reset to 0 otherwise 'locked' is incremented by 1
   * - otherwise it creates a new jwt token
   * - it then returns a response of the form `{ token }` or `{ token, user }`, depending upon the value of the async method `returning` used to generate it
   *   - `token` is the new jwt token
   *   - `user` is an Object with information about the user used to login
   * @func handler
   * @param {Object} ctx Koa ctx
   * @returns {undefined}
   * @throws {Error}
   */
  return async ctx => {
    const adapter = getAdapter()
    const dbLoginAttempts = adapter.dbNameMap.loginAttempts
    const dbPassword = adapter.dbNameMap.password
    const { email, password } = ctx.request.body

    const userMap = await adapter.getUser({ email })
      .catch(() => {
        throw new MantleAuthError({ message: 'Unauthorized', name: INVALID_USER, status: 401 })
      })
      .then(async userMap => {
        const match = await comparePassword(password, userMap.password)

        if (userMap.locked) {
          throw new MantleAuthError({
            message: 'This account has been locked',
            name: ACCOUNT_LOCKED,
            status: 401,
            isLoginValid: match
          })
        }

        if (lockAfter !== null) {
          if (match) {
            const updateMap = { login_attempts: 0 }
            await adapter.updateUser({ email, password: userMap[dbPassword], updateMap })

            return userMap
          } else {
            const incrementLoginAttempt = userMap[dbLoginAttempts] + 1
            const locked = incrementLoginAttempt >= lockAfter
            const updateMap = { login_attempts: incrementLoginAttempt, locked }
            await adapter.updateUser({ email, password: userMap[dbPassword], updateMap })

            throw new MantleAuthError({ message: 'Unauthorized', status: 401, name: INVALID_PASSWORD })
          }
        } else if (match) {
          return userMap
        } else {
          throw new MantleAuthError({ message: 'Unauthorized', status: 401, name: INVALID_PASSWORD })
        }
      })

    const payload = (jwt.payload || defaultPayload)(userMap)
    const token = jwtSign(payload, jwt.secret, jwt.sign || { expiresIn: '1d' })

    const response = { token }

    if (returning) {
      response.user = await createPerson(userMap, returning)
    }

    ctx.ok(response)
  }
}
