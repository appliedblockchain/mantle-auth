'use strict'
const Router = require('koa-joi-router')

const { joiDefinition: joiDefinitionExclude } = require('../../middleware/authorization/exclude')

describe('koa-joi-router mantle-auth exclude function builder', () => {
  const handler = () => {}
  const routeList = [
    {
      authExclude: true,
      handler,
      method: 'get',
      path: '/get-excluded'
    },
    {
      handler,
      method: 'get',
      path: '/get-included'
    },
    {
      authExclude: 'also true',
      handler,
      method: 'post',
      path: '/post-excluded'
    },
    {
      authExclude: 0,
      handler,
      method: 'post',
      path: '/post-included'
    }
  ]

  it('Should build a valid exclude function', () => {
    const router = new Router()
    router.route(routeList)

    const excludeFunction = joiDefinitionExclude(router)

    expect(excludeFunction({ method: 'get', path: '/get-excluded' })).toBe(true)
    expect(excludeFunction({ method: 'get', path: '/get-included' })).toBe(false)
    expect(excludeFunction({ method: 'post', path: '/post-excluded' })).toBe(true)
    expect(excludeFunction({ method: 'post', path: '/post-included' })).toBe(false)

    expect(excludeFunction({ method: 'get', path: '/fake-route' })).toBe(false)
    expect(excludeFunction({ method: 'put', path: '/get-excluded' })).toBe(false)
  })

  it('Should handle routers with a prefix correctly', () => {
    const prefix = '/my-prefix'

    const router = new Router()
    router.route(routeList)
    router.prefix(prefix)

    const excludeFunction = joiDefinitionExclude(router)

    expect(excludeFunction({ method: 'get', path: '/get-excluded' })).toBe(false)
    expect(excludeFunction({ method: 'get', path: `${prefix}/get-excluded` })).toBe(true)

    expect(excludeFunction({ method: 'post', path: '/post-excluded' })).toBe(false)
    expect(excludeFunction({ method: 'post', path: `${prefix}/post-excluded` })).toBe(true)

    expect(excludeFunction({ method: 'get', path: '/get-included' })).toBe(false)
    expect(excludeFunction({ method: 'get', path: `${prefix}/get-included` })).toBe(false)

    expect(excludeFunction({ method: 'get', path: prefix })).toBe(false)
    expect(excludeFunction({ method: 'get', path: `${prefix}/fake-route` })).toBe(false)
    expect(excludeFunction({ method: 'put', path: `${prefix}/get-excluded` })).toBe(false)
  })

  it('Should handle multiple routers correctly', () => {
    const prefix = '/lol'

    const routerList = Array(3).fill(0).map(() => new Router())

    routerList[0].route(routeList[0])
    routerList[0].prefix(prefix)

    routerList[1].route(routeList[1])
    routerList[2].route(routeList.slice(2))

    const excludeFunction = joiDefinitionExclude(routerList)

    expect(excludeFunction({ method: 'get', path: `${prefix}/get-excluded` })).toBe(true)
    expect(excludeFunction({ method: 'get', path: '/get-included' })).toBe(false)
    expect(excludeFunction({ method: 'post', path: '/post-excluded' })).toBe(true)
    expect(excludeFunction({ method: 'post', path: '/post-included' })).toBe(false)

    expect(excludeFunction({ method: 'get', path: '/fake-route' })).toBe(false)
    expect(excludeFunction({ method: 'put', path: '/post-excluded' })).toBe(false)
  })
})
