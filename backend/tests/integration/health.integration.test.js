const request = require('supertest');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const app = require('../../src/app');

describe('integration: health and not found routes', () => {
  test('GET /api/health should return API running', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('ระบบ API พร้อมใช้งาน');
  });

  test('unknown route should return 404', async () => {
    const res = await request(app).get('/api/not-exists');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('ไม่พบเส้นทาง API ที่เรียกใช้');
  });
});
