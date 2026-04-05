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

describe('integration: event routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/events should return approved event list', async () => {
    db.query.mockResolvedValueOnce([[
      {
        eventId: 1,
        title: 'Mock Event',
        approvalStatus: 'APPROVED',
      },
    ]]);

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /api/events/mine should return own created events when authenticated', async () => {
    db.query.mockResolvedValueOnce([[{ eventId: 1, title: 'My Event', approvalStatus: 'PENDING' }]]);
    const token = createToken({ userId: 7, role: 'STUDENT' });

    const res = await request(app)
      .get('/api/events/mine')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  test('GET /api/events/:id/participants should return 403 for non-owner', async () => {
    db.query.mockResolvedValueOnce([[{ eventId: 1, creatorId: 99, title: 'Owner Event' }]]);
    const token = createToken({ userId: 7, role: 'LECTURER' });

    const res = await request(app)
      .get('/api/events/1/participants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('คุณไม่มีสิทธิ์ดูผู้เข้าร่วมกิจกรรมนี้');
  });

  test('GET /api/events/:id/participants should return participants for owner', async () => {
    db.query
      .mockResolvedValueOnce([[{ eventId: 1, creatorId: 7, title: 'Owner Event' }]])
      .mockResolvedValueOnce([[{ registrationId: 1, userId: 11, name: 'Student A' }]]);
    const token = createToken({ userId: 7, role: 'LECTURER' });

    const res = await request(app)
      .get('/api/events/1/participants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.participants).toHaveLength(1);
  });

  test('POST /api/events should return 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Event',
      description: 'Desc',
      eventDate: '2026-04-10T08:00:00Z',
      location: 'Room 1',
      maxParticipants: 10,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('กรุณาเข้าสู่ระบบก่อนใช้งาน');
  });

  test('POST /api/events should create pending event for STUDENT role', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 222 }]);
    const token = createToken({ userId: 2, role: 'STUDENT' });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Event',
        description: 'Desc',
        eventDate: '2026-04-10T08:00:00Z',
        location: 'Room 1',
        maxParticipants: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventId).toBe(222);
    expect(res.body.data.approvalStatus).toBe('PENDING');
  });

  test('POST /api/events should create event for LECTURER', async () => {
    db.query.mockResolvedValueOnce([{ insertId: 123 }]);
    const token = createToken({ userId: 5, role: 'LECTURER' });

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Event',
        description: 'Desc',
        eventDate: '2026-04-10T08:00:00Z',
        location: 'Room 1',
        maxParticipants: 10,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventId).toBe(123);
    expect(res.body.data.approvalStatus).toBe('APPROVED');
  });
});
