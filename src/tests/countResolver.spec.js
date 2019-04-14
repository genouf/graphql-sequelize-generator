const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupServer')

/**
 * Starting the tests
 */
describe('Test the count resolvers', () => {
  let server = null

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(() => closeServer(server))

  beforeEach(async () => {
    await resetDb()
  })

  afterEach(async () => {
    await deleteTables()
  })

  it('Check that you can query a custom list resolver', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getUserAndCount {
              user {
                id
              }
              userCount
          }`
      )
      .set('userId', 1)
    expect(response.body.data.user).not.toBeUndefined()
    expect(response.body.data).toMatchSnapshot('Users ids and count')
    expect(response.body.data.user.length).toBe(response.body.data.userCount)
  })

  it('Check that you can inject types attributes and associations into a random Type', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getOddUsers {
            users: oddUser(limit:10) {
              id
              name
              company {
                id
              }
            }
          }`
      )
      .set('userId', 1)
    expect(response.body.data.users).not.toBeUndefined()
    expect(response.body.data).toMatchSnapshot('Users ids should only be odd.')
  })
})
