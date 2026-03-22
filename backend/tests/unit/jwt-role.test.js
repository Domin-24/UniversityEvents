const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');
const { signAccessToken } = require('../../src/utils/jwt');
const { requireRole } = require('../../src/middlewares/role');

describe('utils/jwt', () => {
  test('should sign token that can be verified', () => {
    const token = signAccessToken({ userId: 1, role: 'STUDENT' });
    const payload = jwt.verify(token, env.jwtSecret);

    expect(payload.userId).toBe(1);
    expect(payload.role).toBe('STUDENT');
  });
});

describe('middlewares/role', () => {
  test('should allow user with allowed role', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = {};
    const next = jest.fn();

    requireRole(['ADMIN'])(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  test('should block request when user is missing', () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    requireRole(['ADMIN'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test('should block request when role is not allowed', () => {
    const req = { user: { role: 'STUDENT' } };
    const res = {};
    const next = jest.fn();

    requireRole(['LECTURER', 'ADMIN'])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
