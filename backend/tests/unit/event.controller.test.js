jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const db = require('../../src/config/db');
const eventController = require('../../src/controllers/event.controller');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

function mockConnection(queryMock) {
  return {
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    query: queryMock,
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
  };
}

describe('event.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createEvent should auto approve event for LECTURER role', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([{ insertId: 11 }]);

    const req = {
      user: { userId: 1, role: 'LECTURER' },
      body: {
        title: 'Event',
        description: 'Desc',
        eventDate: '2026-04-01T10:00:00Z',
        location: 'Main Hall',
        maxParticipants: 20,
      },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.createEvent(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['APPROVED']),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('createEvent should create pending event for STUDENT role', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([{ insertId: 11 }]);

    const req = {
      user: { userId: 1, role: 'STUDENT' },
      body: {
        title: 'Event',
        description: 'Desc',
        eventDate: '2026-04-01T10:00:00Z',
        location: 'Main Hall',
        maxParticipants: 20,
      },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.createEvent(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(db.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['PENDING']),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('createEvent should map validation error to 400', async () => {
    // Arrange
    const req = {
      user: { userId: 1 },
      body: {
        title: '',
        description: 'Desc',
        eventDate: 'bad',
        location: '',
        maxParticipants: -1,
      },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.createEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test('listApprovedEvents should return rows', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ eventId: 1, title: 'Approved Event' }]]);

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listApprovedEvents(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ eventId: 1, title: 'Approved Event' }],
    });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('e.event_date > NOW()'));
  });

  test('listMyRegistrations should return rows', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ registrationId: 1, eventId: 10 }]]);

    const req = { user: { userId: 4 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listMyRegistrations(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ registrationId: 1, eventId: 10 }],
    });
  });

  test('listMyEvents should return rows', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ eventId: 1, title: 'My Event', approvalStatus: 'PENDING' }]]);

    const req = { user: { userId: 4 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listMyEvents(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ eventId: 1, title: 'My Event', approvalStatus: 'PENDING' }],
    });
  });

  test('listEventParticipants should return 404 when event does not exist', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[]]);

    const req = { params: { eventId: '10' }, user: { userId: 4, role: 'LECTURER' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listEventParticipants(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  test('listEventParticipants should return 403 for non-owner', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ eventId: 1, creatorId: 99, title: 'Event' }]]);

    const req = { params: { eventId: '1' }, user: { userId: 4, role: 'LECTURER' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listEventParticipants(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test('listEventParticipants should return participants for owner', async () => {
    // Arrange
    db.query
      .mockResolvedValueOnce([[{ eventId: 1, creatorId: 4, title: 'Event' }]])
      .mockResolvedValueOnce([[{ registrationId: 10, userId: 7, name: 'Student', email: 's@example.com' }]]);

    const req = { params: { eventId: '1' }, user: { userId: 4, role: 'LECTURER' } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.listEventParticipants(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        event: {
          eventId: 1,
          title: 'Event',
        },
        participants: [{ registrationId: 10, userId: 7, name: 'Student', email: 's@example.com' }],
      },
    });
  });

  test('registerForEvent should return 404 when event does not exist', async () => {
    // Arrange
    const queryMock = jest.fn().mockResolvedValueOnce([[]]);
    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '100' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.registerForEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test('registerForEvent should reject already registered user', async () => {
    // Arrange
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce([[
        {
          event_id: 1,
          title: 'Event',
          event_date: '2099-12-31 10:00:00',
          max_participants: 10,
          approval_status: 'APPROVED',
          event_status: 'OPEN',
        },
      ]])
      .mockResolvedValueOnce([[{ reg_id: 1, status: 'REGISTERED' }]]);

    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '1' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.registerForEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(409);
    expect(conn.rollback).toHaveBeenCalled();
  });

  test('registerForEvent should register successfully', async () => {
    // Arrange
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce([[
        {
          event_id: 1,
          title: 'Event',
          event_date: '2099-12-31 10:00:00',
          max_participants: 10,
          approval_status: 'APPROVED',
          event_status: 'OPEN',
        },
      ]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ registeredCount: 1 }]])
      .mockResolvedValueOnce([{}]);

    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '1' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.registerForEvent(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(conn.commit).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('registerForEvent should reject when registration deadline has passed', async () => {
    // Arrange
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce([[
        {
          event_id: 1,
          title: 'Expired Event',
          event_date: '2020-01-01 10:00:00',
          max_participants: 10,
          approval_status: 'APPROVED',
          event_status: 'OPEN',
        },
      ]])
      .mockResolvedValueOnce([{}]);

    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '1' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.registerForEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(409);
    expect(next.mock.calls[0][0].message).toBe('กิจกรรมนี้สิ้นสุดเวลาลงทะเบียนแล้ว');
    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  test('cancelRegistration should return 404 when not registered', async () => {
    // Arrange
    const queryMock = jest.fn().mockResolvedValueOnce([[]]);
    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '1' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.cancelRegistration(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
    expect(conn.rollback).toHaveBeenCalled();
  });

  test('cancelRegistration should cancel successfully', async () => {
    // Arrange
    const queryMock = jest
      .fn()
      .mockResolvedValueOnce([[{ reg_id: 5, status: 'REGISTERED' }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          event_id: 1,
          max_participants: 10,
          event_status: 'OPEN',
        },
      ]])
      .mockResolvedValueOnce([[{ registeredCount: 2 }]])
      .mockResolvedValueOnce([{}]);

    const conn = mockConnection(queryMock);
    db.getConnection.mockResolvedValueOnce(conn);

    const req = { params: { eventId: '1' }, user: { userId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await eventController.cancelRegistration(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(conn.commit).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
