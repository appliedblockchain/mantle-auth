const { bcryptHash, bcryptCompare } = require('../../auth')

describe('Auth:', () => {
  describe('BCrypt:', () => {
    let password, fakePassword

    beforeAll(async () => {
      password = 'password'
      fakePassword = 'mimic_password123'
    })

    it('returns a hashed version of a plain text password via bcryptHash()', async () => {
      const hash = await bcryptHash(password)
      expect(typeof hash).toEqual('string')
      expect(hash).not.toEqual(password)
    })

    it('asserts true if a password is compared to the corresponding hashed password via bcryptCompare()', async () => {
      const hash = await bcryptHash(password)
      const match = await bcryptCompare(password, hash)
      expect(match).toBe(true)
    })

    it('asserts false if a password is compared to the corresponding hashed password via bcryptCompare()', async () => {
      const hash = await bcryptHash(password)
      const match = await bcryptCompare(fakePassword, hash)
      expect(match).toBe(false)
    })
  })
})
