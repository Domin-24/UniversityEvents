const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');
const { signAccessToken } = require('../../src/utils/jwt');
const { requireRole } = require('../../src/middlewares/role');

describe('utils/jwt', () => {
  test('should sign token that can be verified', () => {
    // Arrange
    const claims = { userId: 1, role: 'STUDENT' };

    // Act
    const token = signAccessToken(claims);
    const payload = jwt.verify(token, env.jwtSecret);

    // Assert
    expect(payload.userId).toBe(1);
    expect(payload.role).toBe('STUDENT');
  });
});

describe('middlewares/role', () => {
  test('should allow user with allowed role', () => {
    // Arrange
    const req = { user: { role: 'ADMIN' } };
    const res = {};
    const next = jest.fn();
    const middleware = requireRole(['ADMIN']);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith();
  });

  test('should block request when user is missing', () => {
    // Arrange
    const req = {};
    const res = {};
    const next = jest.fn();
    const middleware = requireRole(['ADMIN']);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test('should block request when role is not allowed', () => {
    // Arrange
    const req = { user: { role: 'STUDENT' } };
    const res = {};
    const next = jest.fn();
    const middleware = requireRole(['LECTURER', 'ADMIN']);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
