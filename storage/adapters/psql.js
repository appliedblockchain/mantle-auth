const initKnex = require('knex')

class PsqlStorageAdapter {
  constructor({ client = 'pg', connection, dbNameMap = {} } = {}) {
    this.knex = initKnex({
      client,
      connection
    })

    this.dbNameMap = Object.assign({}, PsqlStorageAdapter.defaultDbNameMap, dbNameMap)
  }

  createUser({ email, password, queryOptions }) {
    return this.knex(this.dbNameMap.table)
      .insert({ [this.dbNameMap.email]: email, [this.dbNameMap.password]: password }, queryOptions)
  }

  getUser({ email }) {
    const result = this.knex(this.dbNameMap.table)
      .where({ [this.dbNameMap.email]: email })

    return result
  }

  updateUser({ email, password, updateMap, queryOptions }) {
    return this.knex(this.dbNameMap.table)
      .where({ [this.dbNameMap.email]: email, [this.dbNameMap.password]: password })
      .update(updateMap, queryOptions)
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
