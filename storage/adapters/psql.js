const initKnex = require('knex')

class PsqlStorageAdapter {
  constructor({ client = 'pg', connection, dbNameMap = {} } = {}) {
    this.knex = initKnex({
      client,
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
  disableAt: 'disableAt'
}

module.exports = PsqlStorageAdapter
