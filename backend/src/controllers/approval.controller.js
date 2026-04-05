const pool = require('../config/db');
const ApiError = require('../utils/apiError');
const { updateApprovalSchema } = require('../validators/event.validator');

async function listPendingEvents(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
          e.event_id AS eventId,
          e.title,
          e.description,
          e.event_date AS eventDate,
          e.location,
          e.max_participants AS maxParticipants,
          e.approval_status AS approvalStatus,
          u.name AS organizerName,
          u.email AS organizerEmail
       FROM events e
       JOIN users u ON u.user_id = e.create_by
       WHERE e.approval_status = 'PENDING'
       ORDER BY e.created_at ASC`,
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return next(err);
  }
}

async function reviewEvent(req, res, next) {
  try {
    const eventId = Number(req.params.eventId);
    if (Number.isNaN(eventId)) {
      throw new ApiError(400, 'รหัสกิจกรรมไม่ถูกต้อง');
    }

    const payload = updateApprovalSchema.parse(req.body);

    const [events] = await pool.query(
      'SELECT event_id, approval_status FROM events WHERE event_id = ? LIMIT 1',
      [eventId],
    );

    if (events.length === 0) {
      throw new ApiError(404, 'ไม่พบกิจกรรม');
    }

    if (events[0].approval_status !== 'PENDING') {
      throw new ApiError(409, 'กิจกรรมนี้ถูกพิจารณาไปแล้ว');
    }

    await pool.query(
      `UPDATE events
       SET approval_status = ?, event_status = ?
       WHERE event_id = ?`,
      [payload.status, payload.status === 'APPROVED' ? 'OPEN' : 'CLOSED', eventId],
    );

    await pool.query(
      `INSERT INTO approvals (event_id, approved_by, status, remark)
       VALUES (?, ?, ?, ?)`,
      [eventId, req.user.userId, payload.status, payload.remark],
    );

    return res.status(200).json({
      success: true,
      message: payload.status === 'APPROVED' ? 'อนุมัติกิจกรรมสำเร็จ' : 'ปฏิเสธกิจกรรมสำเร็จ',
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }

    return next(err);
  }
}

module.exports = {
  listPendingEvents,
  reviewEvent,
};
