const { hashPassword, comparePassword } = require('../../auth')

describe('Auth:', () => {
  describe('SCrypt:', () => {
    let password, fakePassword

    beforeAll(async () => {
      password = 'password'
      fakePassword = 'mimic_password123'
    })

    it('returns a hashed version of a plain text password via hashPassword()', async () => {
      const hash = await hashPassword(password)
      expect(typeof hash).toEqual('string')
      expect(hash).not.toEqual(password)
    })

    it('asserts true if a password is compared to the corresponding hashed password via comparePassword()', async () => {
      const hash = await hashPassword(password)
      const match = await comparePassword(password, hash)
      expect(match).toBe(true)
    })

    it('asserts false if a password is compared to the corresponding hashed password via comparePassword()', async () => {
      const hash = await hashPassword(password)
      const match = await comparePassword(fakePassword, hash)
      expect(match).toBe(false)
    })
  })
})
