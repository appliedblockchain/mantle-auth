/**
 * interface IStorageAdapter {
 *  createUser({ email, password }) {}
 *  getUser({ email }) {}
 *  updateUser({ email, password, updateMap }) {}
 * }
 */

let _adapter

const setAdapter = adapter => {
  _adapter = adapter
}

const getAdapter = () => _adapter || (() => {
  throw new Error('Adapter has not been set')
})()

module.exports = {
  getAdapter,
  setAdapter
}
