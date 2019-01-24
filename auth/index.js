const jwt = require('jsonwebtoken')
const scrypt = require('./scrypt')

/**
 * @param  {string} password Password to be hashed
 * @param  {object} [options] A set of optional values that can be passed into the hash function
 * @param  {number} [options.N] CPU/memory cost parameter. Must be a power of two greater than one. Defaults to 16384
 * @param  {number} [options.keylen] Length of key. Defaults to 32
 * @param  {number} [options.r] Block size parameter. Defaults to 8
 * @param  {number} [options.p] Parallelization parameter. Defaults to 1
 * @param  {number} [options.maxmem] Memory upper bound. Defaults to 32 * 1024 * 1024
 * @param  {number} [options.salt] Should be as unique as possible. It is recommended that a salt is random and at least 16 bytes long
 * @return {number} A hashed version of the password
 */
const hashPassword = async (password, options) => {
  try {
    return scrypt.hash(password, options)
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
const comparePassword = async (password, hash) => {
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
  comparePassword,
  hashPassword,
  jwtSign
}
