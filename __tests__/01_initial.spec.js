import request from 'supertest'
import app from '../src/app'

describe('Initial test for app', () => {
  it('should response a test end-point', async () => {
    const responce = await request(app).get('/')
    expect(responce.statusCode).toBe(200)
    expect(responce.text).toBe('Test service!')
  })
})