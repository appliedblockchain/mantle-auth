const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// ============================================================================
// BCRYPT
// ============================================================================

/**
 * @param  {string} password
 * @param  {number} saltRounds
 * @return {string} A hashed version of the password
 */
const bcryptHash = async (password, saltRounds = 10) => {
  try {
    return bcrypt.hash(password, saltRounds)
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
    return bcrypt.compare(password, hash)
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
