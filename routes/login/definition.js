const { Joi } = require('koa-joi-router')

module.exports = {
  authExclude: true,
  method: 'post',
  meta: {
    swagger: {
      summary: 'User login',
      description: 'Enables a user to login to their account',
      tags: [ 'auth' ]
    }
  },
  output: {
    200: {
      body: {
        token: Joi.string()
      }
    }
  },
  path: '/login',
  validate: {
    type: 'json',
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  }
}
