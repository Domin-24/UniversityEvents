const request = require('supertest');
const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const db = require('../../src/config/db');
const app = require('../../src/app');

function createToken(user) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: '1h' });
}

describe('integration: registration routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/events/:id/register should return 401 without token', async () => {
    const res = await request(app).post('/api/events/1/register');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('กรุณาเข้าสู่ระบบก่อนใช้งาน');
  });

  test('POST /api/events/:id/register should return 403 for LECTURER', async () => {
    const token = createToken({ userId: 1, role: 'LECTURER' });

    const res = await request(app)
      .post('/api/events/1/register')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
  });

  test('GET /api/events/registrations/me should return own registrations when authenticated', async () => {
    db.query.mockResolvedValueOnce([[
      {
        registrationId: 10,
        eventId: 20,
        title: 'Mock Registered Event',
      },
    ]]);

    const token = createToken({ userId: 7, role: 'STUDENT' });
    const res = await request(app)
      .get('/api/events/registrations/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
