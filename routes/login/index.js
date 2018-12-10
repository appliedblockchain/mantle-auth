const createHandler = require('./create-handler')
const definition = require('./definition')

const createRoute = options => Object.assign({}, definition, { handler: createHandler(options) })

module.exports = {
  createHandler,
  createRoute,
  definition
}
