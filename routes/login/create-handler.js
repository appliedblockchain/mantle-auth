const { getAdapter } = require('../../storage/adapters')
const { comparePassword, jwtSign } = require('../../auth')

/**
 * Creates a new login route handler; See docstring where the return value is defined for info on its behaviour
 * @function createHandler
 * @param {Object} options
 * @param {Object} options.jwt jwt options that control creation of new tokens; See the `jwtSign` in '../../auth'
 * @param {Object} options.jwt.secret The secret to use for the jwt
 * @param {Function} [options.jwt.payload] A Function that can generate the jwt payload from user details; The default is `{ email, id }`
 * @param {Object} [options.jwt.sign={ expiresIn: '1d' }] Options for signing jwt
 * @param {?number} options.lockAfter The number of login attempts a user can fail, after which the account is locked
 * @param {Array.<String>|Function} [options.returning]
 * @returns {Function} A Function that can be used as Koa middleware to provide a login route
 * @see file://../../auth/index.js jwtSign method
 */
module.exports = ({ jwt = {}, lockAfter, comparePasswordFunc = comparePassword, returning }) => {
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
   * - it then returns a response of the form `{ token }` or `{ token, user }`, depending upon the value of `returning` used to generate it
   *   - `token` is the new jwt token
   *   - `user` is an Object with information about the user used to login
   * @func handler
   * @param {Object} ctx Koa ctx
   * @returns {undefined}
   * @throws {Error}
   */
  return async ctx => {
    try {
      const adapter = getAdapter()
      const { email, password } = ctx.request.body

      const userMap = await adapter.getUser({ email })
        .then(async userMap => {
          const match = await comparePasswordFunc(password, userMap.password)

          if (lockAfter !== null) {
            if (userMap.login_attempts >= lockAfter) {
              const updateMap = { login_attempts: userMap.login_attempts + 1 }
              await adapter.updateUser({ email, password, updateMap })

              return ctx.throw(403)
            }

            if (match) {
              const updateMap = { login_attempts: 0 }
              await adapter.updateUser({ email, password, updateMap })

              return userMap
            } else {
              const incrementLoginAttempt = userMap.login_attempts + 1
              const locked = incrementLoginAttempt >= lockAfter
              const updateMap = { login_attempts: incrementLoginAttempt, locked }
              await adapter.updateUser({ email, password, updateMap })

              return Promise.reject()
            }
          } else {
            return match ? userMap : Promise.reject()
          }
        })
        .catch(() => ctx.throw(401))

      const payload = (jwt.payload || defaultPayload)(userMap)
      const token = jwtSign(payload, jwt.secret, jwt.sign || { expiresIn: '1d' })

      const response = { token }

      if (returning) {
        response.user = createPerson(userMap, returning)
      }

      ctx.ok(response)
    } catch (err) {
      throw err
    }
  }
}
