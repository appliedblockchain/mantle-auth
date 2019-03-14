'use strict'

const assert = require('assert')
const { randomBytes, scrypt, createHash } = require('crypto')

const defaultN = process.env.NODE_ENV === 'test' ? 2 : 131072
const defaultKeylen = 32
const defaultR = 8
const defaultP = 1
const defaultMaxmem = 256 * 1024 * 1024

assert(128 * defaultN * defaultR < defaultMaxmem, 'Invalid defaults.')

function secretOf(password, { N = defaultN, keylen = defaultKeylen, r = defaultR, p = defaultP, maxmem = defaultMaxmem, salt }) {
  const effectiveSalt = salt || randomBytes(16)

  assert(Buffer.isBuffer(effectiveSalt), `Expected salt to be a buffer, got ${typeof effectiveSalt}.`)
  assert(effectiveSalt.length === 16, `Expected salt length to be 16, got ${effectiveSalt.length}.`)

  return new Promise((resolve, reject) => {
    scrypt(password, effectiveSalt, keylen, { N, r, p, maxmem }, (err, secret) => {
      if (err) {
        reject(err)
      } else {
        resolve({ N, keylen, r, p, salt: effectiveSalt, secret })
      }
    })
  })
}

function serialize({ N, keylen, r, p, salt, hash }, encoding = 'base64') {
  const head = Buffer.allocUnsafe(16)

  head.write('scrypt256', 0, 9, 'ascii')
  head.writeUInt32BE(N, 9)
  head.writeUInt8(keylen, 13)
  head.writeUInt8(r, 14)
  head.writeUInt8(p, 15)

  return Buffer.concat([
    head,
    salt,
    hash
  ]).toString(encoding)
}

function deserialize(value, encoding = 'base64') {
  const buf = Buffer.from(value, encoding)

  assert(buf.length === 64, `Invalid buffer length ${buf.length}, expected 64.`)

  const result = {
    tag: buf.slice(0, 9).toString('ascii'),
    N: buf.readUInt32BE(9),
    keylen: buf.readUInt8(13),
    r: buf.readUInt8(14),
    p: buf.readUInt8(15),
    salt: buf.slice(16, 32),
    hash: buf.slice(32, 64)
  }

  assert(result.tag === 'scrypt256', `Invalid ${result.tag} tag, expected "scrypt256".`)

  return result
}

async function hash(password, options = {}) {
  const { N, keylen, r, p, salt, secret } = await secretOf(password, options)
  const hash = createHash('sha256').update(secret).digest()
  return serialize({ N, keylen, r, p, salt, hash })
}

async function compare(password, serialized) {
  const { N, keylen, r, p, salt, hash } = deserialize(serialized)
  const { secret } = await secretOf(password, { N, keylen, r, p, salt })

  return Buffer.compare(
    createHash('sha256').update(secret).digest(),
    hash
  ) === 0
}

module.exports = {
  hash,
  compare
}
