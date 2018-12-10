const jwt = require('jsonwebtoken')

module.exports = (secret, options = {}) => {
  if (!secret) {
    throw new Error('Cannot initialize JWT auth middleware handler without providing a secret')
  }

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
