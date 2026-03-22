const pool = require('../config/db');
const ApiError = require('../utils/apiError');
const { createEventSchema, eventIdParamSchema } = require('../validators/event.validator');

async function createEvent(req, res, next) {
  try {
    const payload = createEventSchema.parse(req.body);
    const eventDateForDb = new Date(payload.eventDate)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const [result] = await pool.query(
      `INSERT INTO events
       (create_by, title, description, event_date, location, max_participants, approval_status, event_status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'OPEN')`,
      [
        req.user.userId,
        payload.title,
        payload.description,
        eventDateForDb,
        payload.location,
        payload.maxParticipants,
      ],
    );

    return res.status(201).json({
      success: true,
      message: 'สร้างกิจกรรมสำเร็จ และอยู่ระหว่างรอการอนุมัติ',
      data: {
        eventId: result.insertId,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }

    return next(err);
  }
}

async function listApprovedEvents(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
          e.event_id AS eventId,
          e.title,
          e.description,
          e.event_date AS eventDate,
          e.location,
          e.max_participants AS maxParticipants,
          e.event_status AS eventStatus,
          e.approval_status AS approvalStatus,
           u.name AS organizerName,
           COUNT(r.reg_id) AS registeredCount,
           GREATEST(e.max_participants - COUNT(r.reg_id), 0) AS remainingSlots
       FROM events e
       JOIN users u ON u.user_id = e.create_by
         LEFT JOIN registrations r
          ON r.event_id = e.event_id
          AND r.status = 'REGISTERED'
       WHERE e.approval_status = 'APPROVED'
         GROUP BY
          e.event_id,
          e.title,
          e.description,
          e.event_date,
          e.location,
          e.max_participants,
          e.event_status,
          e.approval_status,
          u.name
       ORDER BY e.event_date ASC`,
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return next(err);
  }
}

async function listMyRegistrations(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
          r.reg_id AS registrationId,
          r.event_id AS eventId,
          r.register_date AS registerDate,
          r.status,
          e.title,
          e.description,
          e.event_date AS eventDate,
          e.location,
          e.event_status AS eventStatus,
          e.approval_status AS approvalStatus,
          e.max_participants AS maxParticipants,
          u.name AS organizerName
       FROM registrations r
       JOIN events e ON e.event_id = r.event_id
       JOIN users u ON u.user_id = e.create_by
       WHERE r.user_id = ?
       ORDER BY r.register_date DESC`,
      [req.user.userId],
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    return next(err);
  }
}

async function registerForEvent(req, res, next) {
  let connection;

  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [events] = await connection.query(
      `SELECT event_id, title, max_participants, approval_status, event_status
       FROM events
       WHERE event_id = ?
       LIMIT 1
       FOR UPDATE`,
      [eventId],
    );

    if (events.length === 0) {
      throw new ApiError(404, 'ไม่พบกิจกรรม');
    }

    const event = events[0];

    if (event.approval_status !== 'APPROVED') {
      throw new ApiError(409, 'กิจกรรมนี้ยังไม่เปิดให้ลงทะเบียน');
    }

    if (['CLOSED', 'CANCELLED'].includes(event.event_status)) {
      throw new ApiError(409, 'กิจกรรมนี้ปิดรับลงทะเบียนแล้ว');
    }

    const [registrations] = await connection.query(
      `SELECT reg_id, status
       FROM registrations
       WHERE user_id = ? AND event_id = ?
       LIMIT 1`,
      [req.user.userId, eventId],
    );

    if (registrations.length > 0) {
      const registration = registrations[0];

      if (registration.status === 'REGISTERED') {
        throw new ApiError(409, 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว');
      }

      await connection.query(
        `UPDATE registrations
         SET status = 'REGISTERED', register_date = NOW(), check_in_time = NULL, check_status = FALSE
         WHERE reg_id = ?`,
        [registration.reg_id],
      );
    } else {
      await connection.query(
        `INSERT INTO registrations (user_id, event_id, status)
         VALUES (?, ?, 'REGISTERED')`,
        [req.user.userId, eventId],
      );
    }

    const [[{ registeredCount }]] = await connection.query(
      `SELECT COUNT(*) AS registeredCount
       FROM registrations
       WHERE event_id = ? AND status = 'REGISTERED'`,
      [eventId],
    );

    if (registeredCount > event.max_participants) {
      throw new ApiError(409, 'กิจกรรมเต็มแล้ว');
    }

    await connection.query(
      `UPDATE events
       SET event_status = ?
       WHERE event_id = ?`,
      [registeredCount >= event.max_participants ? 'FULL' : 'OPEN', eventId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'ลงทะเบียนกิจกรรมสำเร็จ',
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }

    return next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function cancelRegistration(req, res, next) {
  let connection;

  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [registrations] = await connection.query(
      `SELECT reg_id, status
       FROM registrations
       WHERE user_id = ? AND event_id = ?
       LIMIT 1
       FOR UPDATE`,
      [req.user.userId, eventId],
    );

    if (registrations.length === 0 || registrations[0].status !== 'REGISTERED') {
      throw new ApiError(404, 'คุณยังไม่ได้ลงทะเบียนกิจกรรมนี้');
    }

    await connection.query(
      `UPDATE registrations
       SET status = 'CANCELLED'
       WHERE reg_id = ?`,
      [registrations[0].reg_id],
    );

    const [[event]] = await connection.query(
      `SELECT event_id, max_participants, event_status
       FROM events
       WHERE event_id = ?
       LIMIT 1
       FOR UPDATE`,
      [eventId],
    );

    const [[{ registeredCount }]] = await connection.query(
      `SELECT COUNT(*) AS registeredCount
       FROM registrations
       WHERE event_id = ? AND status = 'REGISTERED'`,
      [eventId],
    );

    if (event && !['CLOSED', 'CANCELLED'].includes(event.event_status)) {
      await connection.query(
        `UPDATE events
         SET event_status = ?
         WHERE event_id = ?`,
        [registeredCount >= event.max_participants ? 'FULL' : 'OPEN', eventId],
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'ยกเลิกการลงทะเบียนสำเร็จ',
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }

    return next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  createEvent,
  listApprovedEvents,
  listMyRegistrations,
  registerForEvent,
  cancelRegistration,
};
