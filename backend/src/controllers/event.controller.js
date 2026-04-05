const pool = require('../config/db');
const ApiError = require('../utils/apiError');
const { createEventSchema, eventIdParamSchema } = require('../validators/event.validator');

async function createEvent(req, res, next) {
  try {
    const payload = createEventSchema.parse(req.body);
    const isAutoApproved = ['LECTURER', 'ADMIN'].includes(req.user?.role);
    const approvalStatus = isAutoApproved ? 'APPROVED' : 'PENDING';
    const eventDateForDb = new Date(payload.eventDate)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    const [result] = await pool.query(
      `INSERT INTO events
       (create_by, title, description, event_date, location, max_participants, approval_status, event_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        req.user.userId,
        payload.title,
        payload.description,
        eventDateForDb,
        payload.location,
        payload.maxParticipants,
        approvalStatus,
      ],
    );

    return res.status(201).json({
      success: true,
      message: isAutoApproved
        ? 'สร้างกิจกรรมสำเร็จ และเผยแพร่ได้ทันที'
        : 'สร้างกิจกรรมสำเร็จ และอยู่ระหว่างรอการอนุมัติ',
      data: {
        eventId: result.insertId,
        approvalStatus,
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
         AND e.event_date > NOW()
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

async function listMyEvents(req, res, next) {
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
          COUNT(r.reg_id) AS registeredCount,
          GREATEST(e.max_participants - COUNT(r.reg_id), 0) AS remainingSlots
       FROM events e
       LEFT JOIN registrations r
         ON r.event_id = e.event_id
         AND r.status = 'REGISTERED'
       WHERE e.create_by = ?
       GROUP BY
         e.event_id,
         e.title,
         e.description,
         e.event_date,
         e.location,
         e.max_participants,
         e.event_status,
         e.approval_status
       ORDER BY e.created_at DESC`,
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

async function listEventParticipants(req, res, next) {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);

    const [events] = await pool.query(
      `SELECT event_id AS eventId, create_by AS creatorId, title
       FROM events
       WHERE event_id = ?
       LIMIT 1`,
      [eventId],
    );

    if (events.length === 0) {
      throw new ApiError(404, 'ไม่พบกิจกรรม');
    }

    const event = events[0];
    const isOwner = event.creatorId === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'คุณไม่มีสิทธิ์ดูผู้เข้าร่วมกิจกรรมนี้');
    }

    const [participants] = await pool.query(
      `SELECT
          r.reg_id AS registrationId,
          r.user_id AS userId,
          u.name,
          u.email,
          r.register_date AS registerDate,
          r.status,
          r.check_status AS checkStatus,
          r.check_in_time AS checkInTime
       FROM registrations r
       JOIN users u ON u.user_id = r.user_id
       WHERE r.event_id = ?
         AND r.status = 'REGISTERED'
       ORDER BY r.register_date ASC`,
      [eventId],
    );

    return res.status(200).json({
      success: true,
      data: {
        event: {
          eventId: event.eventId,
          title: event.title,
        },
        participants,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return next(new ApiError(400, 'ข้อมูลไม่ถูกต้อง', err.issues));
    }

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
      `SELECT event_id, title, event_date, max_participants, approval_status, event_status
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

    if (new Date(event.event_date) <= new Date()) {
      await connection.query(
        `UPDATE events
         SET event_status = 'CLOSED'
         WHERE event_id = ?`,
        [eventId],
      );

      throw new ApiError(409, 'กิจกรรมนี้สิ้นสุดเวลาลงทะเบียนแล้ว');
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
  listMyEvents,
  listEventParticipants,
  registerForEvent,
  cancelRegistration,
};
