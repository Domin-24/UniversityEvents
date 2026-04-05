jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

const db = require('../../src/config/db');
const approvalController = require('../../src/controllers/approval.controller');

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('approval.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('listPendingEvents should return rows', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ eventId: 1, title: 'Pending Event' }]]);

    const req = {};
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.listPendingEvents(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ eventId: 1, title: 'Pending Event' }],
    });
  });

  test('reviewEvent should reject invalid eventId', async () => {
    // Arrange
    const req = {
      params: { eventId: 'abc' },
      body: { status: 'APPROVED', remark: 'ok' },
      user: { userId: 9 },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.reviewEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  test('reviewEvent should reject when event not found', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[]]);

    const req = {
      params: { eventId: '1' },
      body: { status: 'APPROVED', remark: 'ok' },
      user: { userId: 9 },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.reviewEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  test('reviewEvent should reject already reviewed event', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ event_id: 1, approval_status: 'APPROVED' }]]);

    const req = {
      params: { eventId: '1' },
      body: { status: 'APPROVED', remark: 'ok' },
      user: { userId: 9 },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.reviewEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  test('reviewEvent should apply review successfully', async () => {
    // Arrange
    db.query.mockResolvedValueOnce([[{ event_id: 1, approval_status: 'PENDING' }]]);
    db.query.mockResolvedValueOnce([{}]);
    db.query.mockResolvedValueOnce([{}]);

    const req = {
      params: { eventId: '1' },
      body: { status: 'APPROVED', remark: 'approved' },
      user: { userId: 9 },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.reviewEvent(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test('reviewEvent should map zod validation error to 400', async () => {
    // Arrange
    const req = {
      params: { eventId: '1' },
      body: { status: 'INVALID' },
      user: { userId: 9 },
    };
    const res = mockRes();
    const next = jest.fn();

    // Act
    await approvalController.reviewEvent(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
