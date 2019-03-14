const data = [
  { email: 'alice@example.com', name: 'Alison', password: 'abc' },
  { email: 'bob@example.com', name: 'Bobby', password: '123' }
]

module.exports = ({ after = () => {}, before = () => {}, createAdapter }) => () => {
  let adapter

  beforeAll(() => before(data))

  beforeEach(() => {
    adapter = createAdapter(data)
  })

  afterEach(async () => {
    await adapter.destroy()
    adapter = null
  })

  afterAll(after)

  it('Should get existing user data', async () => {
    const user1 = await adapter.getUser({ email: data[0].email })
    expect(user1).toEqual(data[0])

    const user2 = await adapter.getUser({ email: data[1].email })
    expect(user2).toEqual(data[1])

    await expect(adapter.getUser({ email: 'claire@example.com' })).rejects.toThrow()
  })

  it('Should create new user data', async () => {
    const email = 'dan@example.com'
    const password = ':@~'

    const userMap = { email, password }

    await expect(adapter.createUser(userMap)).resolves.not.toThrow()
    expect(await adapter.getUser({ email })).toMatchObject(userMap)

    await expect(adapter.createUser({ email })).rejects.toThrow()
    await expect(adapter.createUser({ password })).rejects.toThrow()

    await expect(adapter.createUser(userMap)).rejects.toThrow()
    await expect(adapter.createUser(data[0])).rejects.toThrow()
  })

  it('Should update existing user data', async () => {
    const [ user1 ] = data
    const { email, password } = user1

    const updateMap = { email, password: 'qwe' }

    await expect(adapter.updateUser({ email, password, updateMap })).resolves.not.toThrow()
    expect(await adapter.getUser({ email })).toEqual({ ...user1, ...updateMap })

    await expect(adapter.updateUser({ email: ':o', password, updateMap })).rejects.toThrow()
    await expect(adapter.updateUser({ email, password, updateMap })).rejects.toThrow()
  })
}
