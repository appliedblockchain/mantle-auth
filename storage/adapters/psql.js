const initKnex = require('knex')

class PsqlStorageAdapter {
  /**
   * Adapter that interacts with a Postgres database to create/retrieve user information. Will establish a connection with the database using `knex` when initialised.
   * @param {Object} options
   * @param {Object|String} options.connection Settings for `knex` to connect to the Postgres database; See the `knex` initialization `connection` property for more info
   * @param {Object.<String,String>} [dbNameMap] Defines the name of the database table where user credentials are stored as well as the column names that define those credentials. See `PsqlStorageAdapter.defaultDbNameMap` for defaults
   * @see https://knexjs.org/#Installation-client
   */
  constructor({ connection, dbNameMap = {} } = {}) {
    this.knex = initKnex({
      client: 'pg',
      connection
    })

    this.dbNameMap = Object.assign({}, PsqlStorageAdapter.defaultDbNameMap, dbNameMap)
  }

  async createUser({ email, password, queryOptions = {} }) {
    const { returning } = queryOptions

    const result = await this.knex(this.dbNameMap.table)
      .insert({ [this.dbNameMap.email]: email, [this.dbNameMap.password]: password }, returning || [ this.dbNameMap.email ])
      .then(createdList => createdList.length ? createdList : Promise.reject())
      .catch(() => {
        throw new Error(`Failed to create user with email "${email}"`)
      })

    return (returning && result) || undefined
  }

  destroy() {
    return this.knex.destroy()
  }

  async getUser({ email }) {
    const result = await this.knex(this.dbNameMap.table)
      .where({ [this.dbNameMap.email]: email })
      .then(resultList => resultList.length ? resultList[0] : Promise.reject())
      .catch(() => {
        throw new Error(`Failed to find user with email "${email}"`)
      })

    return result
  }

  async updateUser({ email, password, updateMap, queryOptions = {} }) {
    const { returning } = queryOptions

    const result = await this.knex(this.dbNameMap.table)
      .where({ [this.dbNameMap.email]: email, [this.dbNameMap.password]: password })
      .update(updateMap, returning || [ this.dbNameMap.email ])
      .then(updatedList => updatedList.length ? updatedList : Promise.reject())
      .catch(() => {
        throw new Error(`Failed to update user with email "${email}"`)
      })

    return (returning && result) || undefined
  }
}

PsqlStorageAdapter.defaultDbNameMap = {
  table: 'person',
  email: 'email',
  password: 'password',
  locked: 'locked',
  loginAttempts: 'login_attempts',
  disableAt: 'disableAt'
}

module.exports = PsqlStorageAdapter
