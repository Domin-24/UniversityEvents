const request = require('supertest');
const bcrypt = require('bcryptjs');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const db = require('../../src/config/db');
const app = require('../../src/app');

describe('integration: auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register should return 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'bad-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register should return 409 when email already exists', async () => {
    db.query.mockResolvedValueOnce([[{ user_id: 1 }]]);

    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123',
      role: 'STUDENT',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('อีเมลนี้ถูกใช้งานแล้ว');
  });

  test('POST /api/auth/register should return 201 on success', async () => {
    db.query.mockResolvedValueOnce([[]]);
    db.query.mockResolvedValueOnce([{ insertId: 99 }]);

    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123',
      role: 'STUDENT',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.userId).toBe(99);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login should return 401 when user not found', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app).post('/api/auth/login').send({
      email: 'notfound@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  });

  test('POST /api/auth/login should return 200 on valid credentials', async () => {
    const hash = await bcrypt.hash('Password123', 10);

    db.query.mockResolvedValueOnce([[
      {
        user_id: 3,
        name: 'Bob',
        email: 'bob@example.com',
        password: hash,
        role: 'STUDENT',
      },
    ]]);

    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.userId).toBe(3);
    expect(res.body.data.token).toBeDefined();
  });
});
