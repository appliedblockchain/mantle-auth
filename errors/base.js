class MantleAuthError extends Error {
  constructor({
    fileName,
    message,
    lineNumber,
    name,
    expose = true,
    status = 500
  }) {
    super(message, fileName, lineNumber)

    this.expose = expose
    this.name = name
    this.status = status

    this.isMantleAuth = true
  }
}

MantleAuthError.ERRORS = {
  LOGIN_REQUIRED: 'LoginRequired',
  ACCOUNT_LOCKED: 'AccountLocked',
  INVALID_USER: 'InvalidUser',
  INVALID_PASSWORD: 'InvalidPassword'
}

module.exports = MantleAuthError
