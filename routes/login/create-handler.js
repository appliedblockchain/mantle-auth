const { getAdapter } = require('../../storage/adapters')
const { comparePassword, jwtSign } = require('../../auth')

module.exports = ({ jwt = {}, returning }) => {
  if (!(jwt || jwt.secret)) {
    throw new Error('jwt.secret is required')
  }

  const defaultPayload = userMap => ({ email: userMap.email, id: userMap.id })

  const createPerson = (personMap, selector) => {
    let result

    switch (typeof selector) {
      case 'array':
        result = {}
        selector.forEach(p => {
          result[p] = personMap[p]
        })
        break

      case 'function':
        result = selector(personMap)
        break
    }

    return result
  }

  return async ctx => {
    try {
      const adapter = getAdapter()
      const { email, password } = ctx.request.body

      const [ userMap ] = await adapter.getUser({ email })

      const match = await comparePassword(password, userMap.password)

      if (!match) {
        ctx.throw(401)
      }

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
