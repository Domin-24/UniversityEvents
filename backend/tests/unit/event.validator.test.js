const {
  createEventSchema,
  updateApprovalSchema,
  eventIdParamSchema,
} = require('../../src/validators/event.validator');

describe('event.validator createEventSchema', () => {
  test('should parse valid event payload', () => {
    // Arrange
    const input = {
      title: 'AI Workshop',
      description: 'Hands-on workshop',
      eventDate: '2026-04-01T10:00:00Z',
      location: 'Room A',
      maxParticipants: 30,
    };

    // Act
    const payload = createEventSchema.parse(input);

    // Assert
    expect(payload.maxParticipants).toBe(30);
  });

  test('should reject invalid eventDate', () => {
    // Arrange
    const input = {
      title: 'AI Workshop',
      description: 'Hands-on workshop',
      eventDate: '01/04/2026 10:00',
      location: 'Room A',
      maxParticipants: 30,
    };

    // Act
    const parse = () => createEventSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });

  test('should reject non-integer maxParticipants', () => {
    // Arrange
    const input = {
      title: 'AI Workshop',
      description: 'Hands-on workshop',
      eventDate: '2026-04-01T10:00:00Z',
      location: 'Room A',
      maxParticipants: 2.5,
    };

    // Act
    const parse = () => createEventSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });
});

describe('event.validator updateApprovalSchema', () => {
  test('should parse valid approval payload', () => {
    // Arrange
    const input = {
      status: 'APPROVED',
      remark: 'Looks good',
    };

    // Act
    const payload = updateApprovalSchema.parse(input);

    // Assert
    expect(payload.status).toBe('APPROVED');
  });

  test('should reject invalid status', () => {
    // Arrange
    const input = { status: 'OPEN' };

    // Act
    const parse = () => updateApprovalSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });
});

describe('event.validator eventIdParamSchema', () => {
  test('should coerce positive numeric string', () => {
    // Arrange
    const input = { eventId: '12' };

    // Act
    const payload = eventIdParamSchema.parse(input);

    // Assert
    expect(payload.eventId).toBe(12);
  });

  test('should reject non-positive number', () => {
    // Arrange
    const input = { eventId: '0' };

    // Act
    const parse = () => eventIdParamSchema.parse(input);

    // Assert
    expect(parse).toThrow();
  });
});
