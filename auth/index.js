const jwt = require('jsonwebtoken')
const scrypt = require('./scrypt')

/**
 * @param  {string} password
 * @return {string} A hashed version of the password
 */
const bcryptHash = async (password) => {
  try {
    return scrypt.hash(password)
  } catch (err) {
    throw err
  }
}

/**
 * @param  {string} password
 * @param  {string} hash
 * @return {bool}
 * @description Compares a plain text password to a hashed password and returns a boolean
 *    indicating whether the two match
 */
const bcryptCompare = async (password, hash) => {
  try {
    return scrypt.compare(password, hash)
  } catch (err) {
    throw err
  }
}

// ============================================================================
// JWT / Auth
// ============================================================================

/**
 *
 * @param  {string|object} payload
 * @param  {string} secret
 * @param  {object} options
 * @return {string}
 * @description Signs a payload and returns a JWT
 */
const jwtSign = (payload, secret, options) => {
  const token = jwt.sign(payload, secret, options)
  return token
}

module.exports = {
  bcryptCompare,
  bcryptHash,
  jwtSign
}
