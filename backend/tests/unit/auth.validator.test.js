const { registerSchema, loginSchema } = require('../../src/validators/auth.validator');

describe('auth.validator registerSchema', () => {
  test('should parse valid payload and default role to STUDENT', () => {
    // Arrange
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'Password123',
    };

    // Act
    const data = registerSchema.parse(input);

    // Assert
    expect(data.role).toBe('STUDENT');
    expect(data.name).toBe('Alice');
  });

  test('should parse valid lecturer role', () => {
    // Arrange
    const input = {
      name: 'Lecturer',
      email: 'lecturer@example.com',
      password: 'Password123',
      role: 'LECTURER',
    };

    // Act
    const data = registerSchema.parse(input);

    // Assert
    expect(data.role).toBe('LECTURER');
  });

  test('should reject invalid email', () => {
    // Arrange
    const input = {
      name: 'Alice',
      email: 'not-an-email',
      password: 'Password123',
    };

    // Act
    const parse = () => registerSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });

  test('should reject short password', () => {
    // Arrange
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      password: '123',
    };

    // Act
    const parse = () => registerSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });

  test('should reject blank name after trim', () => {
    // Arrange
    const input = {
      name: '   ',
      email: 'alice@example.com',
      password: 'Password123',
    };

    // Act
    const parse = () => registerSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });
});

describe('auth.validator loginSchema', () => {
  test('should parse valid login payload', () => {
    // Arrange
    const input = {
      email: 'alice@example.com',
      password: 'Password123',
    };

    // Act
    const data = loginSchema.parse(input);

    // Assert
    expect(data.email).toBe('alice@example.com');
  });

  test('should reject missing password', () => {
    // Arrange
    const input = {
      email: 'alice@example.com',
      password: '',
    };

    // Act
    const parse = () => loginSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });
});
