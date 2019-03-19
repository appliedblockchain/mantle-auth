const MemoryAdapter = require('storage/adapters/memory')
const base = require('./base')

describe('The memory storage adapter', base({ createAdapter: data => new MemoryAdapter({ userDataList: data }) }))
