const {
  createEventSchema,
  updateApprovalSchema,
  eventIdParamSchema,
} = require('../../src/validators/event.validator');

describe('event.validator createEventSchema', () => {
  test('should parse valid event payload', () => {
    const payload = createEventSchema.parse({
      title: 'AI Workshop',
      description: 'Hands-on workshop',
      eventDate: '2026-04-01T10:00:00Z',
      location: 'Room A',
      maxParticipants: 30,
    });

    expect(payload.maxParticipants).toBe(30);
  });

  test('should reject invalid eventDate', () => {
    expect(() =>
      createEventSchema.parse({
        title: 'AI Workshop',
        description: 'Hands-on workshop',
        eventDate: '01/04/2026 10:00',
        location: 'Room A',
        maxParticipants: 30,
      }),
    ).toThrow();
  });

  test('should reject non-integer maxParticipants', () => {
    expect(() =>
      createEventSchema.parse({
        title: 'AI Workshop',
        description: 'Hands-on workshop',
        eventDate: '2026-04-01T10:00:00Z',
        location: 'Room A',
        maxParticipants: 2.5,
      }),
    ).toThrow();
  });
});

describe('event.validator updateApprovalSchema', () => {
  test('should parse valid approval payload', () => {
    const payload = updateApprovalSchema.parse({
      status: 'APPROVED',
      remark: 'Looks good',
    });

    expect(payload.status).toBe('APPROVED');
  });

  test('should reject invalid status', () => {
    expect(() =>
      updateApprovalSchema.parse({
        status: 'OPEN',
      }),
    ).toThrow();
  });
});

describe('event.validator eventIdParamSchema', () => {
  test('should coerce positive numeric string', () => {
    const payload = eventIdParamSchema.parse({ eventId: '12' });
    expect(payload.eventId).toBe(12);
  });

  test('should reject non-positive number', () => {
    expect(() => eventIdParamSchema.parse({ eventId: '0' })).toThrow();
  });
});
