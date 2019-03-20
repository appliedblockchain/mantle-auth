class MemoryAdapter {
  /**
   * Adapter that uses a JavaScript Object to store user data. Intended for use mainly to aid testing.
   * @param {Object} [userDataList] Data to initialize the data store with
   */
  constructor({ userDataList = [], dbNameMap = {} } = {}) {
    this.userDataMap = {}
    this.dbNameMap = { ...MemoryAdapter.defaultDbNameMap, dbNameMap }

    for (const data of userDataList) {
      this.userDataMap[data[this.dbNameMap.email]] = data
    }
  }

  async createUser({ email, password }) {
    if (typeof email !== 'string') {
      throw new Error(`Invalid email "${email}"`)
    }

    if (typeof password !== 'string') {
      throw new Error(`Invalid password "${password}"`)
    }

    if (this.userDataMap[email]) {
      throw new Error(`User with email "${email} already exists`)
    }

    this.userDataMap[email] = this._createUserData({ email, password })
    return email
  }

  destroy() {
    delete this.userDataMap
  }

  async getUser({ email }) {
    const userData = this.userDataMap[email]

    if (!userData) {
      throw new Error(`No user with email "${email}" found`)
    }

    return Object.assign({}, userData)
  }

  async updateUser({ email, password, updateMap }) {
    const userData = this.userDataMap[email]

    if (!userData) {
      throw new Error(`User with email ${email} does not exist`)
    }

    if (password !== userData.password) {
      throw new Error(`Incorrect password given to update user ${email}`)
    }

    for (const k in updateMap) {
      userData[k] = updateMap[k]
    }

    return userData[this.dbNameMap.email]
  }

  _createUserData({ email, password }) {
    return { email, password }
  }
}

MemoryAdapter.defaultDbNameMap = {
  table: 'person',
  email: 'email',
  password: 'password',
  locked: 'locked',
  loginAttempts: 'login_attempts',
  disableAt: 'disableAt'
}

module.exports = MemoryAdapter
