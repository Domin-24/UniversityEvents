const bcrypt = require('bcryptjs');

jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../src/config/db');
const authController = require('../../src/controllers/auth.controller');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('auth.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register should create user successfully', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[]]);
    db.query.mockResolvedValueOnce([{ insertId: 7 }]);

    const req = {
      body: {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password123',
        role: 'STUDENT',
      },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.register(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('register should reject duplicate email', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ user_id: 1 }]]);

    const req = {
      body: {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password123',
      },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.register(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  test('register should return validation error', async () => {
    // Arrange
    const req = { body: { name: '', email: 'bad', password: '1' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.register(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test('login should reject unknown user', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[]]);

    const req = { body: { email: 'x@example.com', password: 'Password123' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.login(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test('login should reject invalid password', async () => {
    // Arrange
    const hash = await bcrypt.hash('Password123', 10);
    db.query.mockResolvedValueOnce([[
      {
        user_id: 2,
        name: 'User',
        email: 'u@example.com',
        password: hash,
        role: 'STUDENT',
      },
    ]]);

    const req = { body: { email: 'u@example.com', password: 'WrongPassword123' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.login(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test('login should succeed with valid credentials', async () => {
    // Arrange
    const hash = await bcrypt.hash('Password123', 10);
    db.query.mockResolvedValueOnce([[
      {
        user_id: 2,
        name: 'User',
        email: 'u@example.com',
        password: hash,
        role: 'STUDENT',
      },
    ]]);

    const req = { body: { email: 'u@example.com', password: 'Password123' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await authController.login(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test('me should return current user', () => {
    // Arrange
    const req = { user: { userId: 1, role: 'STUDENT' } };
    const res = mockRes();

    // Act
    authController.me(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { user: req.user },
    });
  });
});
