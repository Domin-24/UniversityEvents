const { registerSchema, loginSchema } = require('../../src/validators/auth.validator');

describe('auth.validator registerSchema', () => {
  test('should parse valid payload and default role to STUDENT', () => {
    const data = registerSchema.parse({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123',
    });

    expect(data.role).toBe('STUDENT');
    expect(data.name).toBe('Alice');
  });

  test('should parse valid lecturer role', () => {
    const data = registerSchema.parse({
      name: 'Lecturer',
      email: 'lecturer@example.com',
      password: 'Password123',
      role: 'LECTURER',
    });

    expect(data.role).toBe('LECTURER');
  });

  test('should reject invalid email', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Alice',
        email: 'not-an-email',
        password: 'Password123',
      }),
    ).toThrow();
  });

  test('should reject short password', () => {
    expect(() =>
      registerSchema.parse({
        name: 'Alice',
        email: 'alice@example.com',
        password: '123',
      }),
    ).toThrow();
  });

  test('should reject blank name after trim', () => {
    expect(() =>
      registerSchema.parse({
        name: '   ',
        email: 'alice@example.com',
        password: 'Password123',
      }),
    ).toThrow();
  });
});

describe('auth.validator loginSchema', () => {
  test('should parse valid login payload', () => {
    const data = loginSchema.parse({
      email: 'alice@example.com',
      password: 'Password123',
    });

    expect(data.email).toBe('alice@example.com');
  });

  test('should reject missing password', () => {
    expect(() =>
      loginSchema.parse({
        email: 'alice@example.com',
        password: '',
      }),
    ).toThrow();
  });
});
