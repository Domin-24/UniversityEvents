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

describe('integration: approval routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/approvals/pending should return 403 for STUDENT', async () => {
    const token = createToken({ userId: 2, role: 'STUDENT' });

    const res = await request(app)
      .get('/api/approvals/pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้');
  });

  test('GET /api/approvals/pending should return 200 for LECTURER', async () => {
    db.query.mockResolvedValueOnce([[
      {
        eventId: 1,
        title: 'Pending Event',
        approvalStatus: 'PENDING',
      },
    ]]);

    const token = createToken({ userId: 5, role: 'LECTURER' });
    const res = await request(app)
      .get('/api/approvals/pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('PATCH /api/approvals/:eventId should return 400 for invalid eventId', async () => {
    const token = createToken({ userId: 5, role: 'LECTURER' });

    const res = await request(app)
      .patch('/api/approvals/not-a-number')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'APPROVED', remark: 'ok' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('รหัสกิจกรรมไม่ถูกต้อง');
  });
});
