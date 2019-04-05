const baseError = { isMantleAuth: true }

const accountLocked = { ...baseError, name: 'AccountLocked' }
const passwordInvalid = { ...baseError, name: 'PasswordInvalid' }

module.exports = {
  accountLocked,
  passwordInvalid
}
