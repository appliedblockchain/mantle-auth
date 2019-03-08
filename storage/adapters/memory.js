class MemoryAdapter {
  constructor(userDataList) {
    this.userDataMap = {}

    for (const data of userDataList) {
      this.userDataMap[data.email] = data
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

    return userData.email
  }

  _createUserData({ email, password }) {
    return { email, password }
  }
}

module.exports = MemoryAdapter
